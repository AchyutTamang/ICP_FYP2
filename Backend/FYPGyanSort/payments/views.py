import uuid
import requests
import json
from django.conf import settings
from django.shortcuts import redirect
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Payment
from .serializers import PaymentSerializer, PaymentInitiateSerializer, PaymentVerifySerializer

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Filter payments by user email
        return Payment.objects.filter(user_email=user.email).order_by('-created_at')

    
    @action(detail=False, methods=['post'], url_path='initiate-khalti')
    def initiate_khalti_payment(self, request):
        serializer = PaymentInitiateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        user = request.user
        
        # Determine user type and ID
        if hasattr(user, 'instructor'):
            user_type = 'instructor'
            user_id = user.instructor.id
        elif hasattr(user, 'student'):
            user_type = 'student'
            user_id = user.student.id
        else:
            # Try to find if this user has a student profile by email
            from students.models import Student
            try:
                student = Student.objects.get(email=user.email)
                user_type = 'student'
                user_id = student.id
            except Student.DoesNotExist:
                # Try to find if this user has an instructor profile by email
                from instructors.models import Instructor
                try:
                    instructor = Instructor.objects.get(email=user.email)
                    user_type = 'instructor'
                    user_id = instructor.id
                except Instructor.DoesNotExist:
                    return Response({"detail": "User profile not found"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate a unique transaction ID
        transaction_id = f"GS-{uuid.uuid4().hex[:8].upper()}"
        
        # Create a payment record
        payment = Payment.objects.create(
            transaction_id=transaction_id,
            amount=serializer.validated_data['amount'],
            status='pending',
            payment_type='khalti',
            user_email=user.email,
            user_type=user_type,
            user_id=user_id,
            product_name=serializer.validated_data.get('product_name', 'GyanSort Course'),
            description=serializer.validated_data.get('description', '')
        )
        
        # Convert amount to paisa (1 NPR = 100 paisa)
        amount_in_paisa = int(float(payment.amount) * 100)
        
        # Prepare Khalti payment data
        khalti_data = {
            "return_url": request.data.get('return_url', f"{settings.FRONTEND_URL}/payment/success"),
            "website_url": settings.FRONTEND_URL,
            "amount": amount_in_paisa,
            "purchase_order_id": transaction_id,
            "purchase_order_name": payment.product_name,
            "customer_info": {
                "name": user.get_full_name() if hasattr(user, 'get_full_name') else user.email,
                "email": user.email,
                "phone": request.data.get('phone', "9800000000")  # Added default phone number
            }
        }
        
        # Add product details if available
        if payment.description:
            khalti_data["product_details"] = [
                {
                    "identity": transaction_id,
                    "name": payment.product_name,
                    "total_price": amount_in_paisa,
                    "quantity": 1,
                    "unit_price": amount_in_paisa
                }
            ]
        
        # Make request to Khalti API
        headers = {
            "Authorization": f"Key {settings.KHALTI_SECRET_KEY}",
            "Content-Type": "application/json"
        }
        
        print(f"Sending request to Khalti with headers: {headers}")
        print(f"Khalti request data: {khalti_data}")
        
        try:
            response = requests.post(
                f"{settings.KHALTI_API_URL}/epayment/initiate/", 
                headers=headers,
                json=khalti_data  # Changed from data=json.dumps(khalti_data) to json=khalti_data
            )
            
            print(f"Khalti API status code: {response.status_code}")
            print(f"Khalti API raw response: {response.text}")
            
            try:
                response_data = response.json()
                print(f"Khalti API response: {response_data}")
            except ValueError:
                print(f"Could not parse JSON response: {response.text}")
                response_data = {"detail": "Invalid response from Khalti"}
            
            if response.status_code == 200 and "pidx" in response_data:
                # Update payment with Khalti pidx
                payment.pidx = response_data["pidx"]
                payment.save()
                
                return Response({
                    "payment_id": payment.id,
                    "transaction_id": transaction_id,
                    "khalti_payment_url": response_data["payment_url"],
                    "pidx": response_data["pidx"]
                }, status=status.HTTP_200_OK)
            else:
                payment.status = 'failed'
                payment.save()
                
                return Response({
                    "detail": "Failed to initiate payment with Khalti",
                    "khalti_response": response_data
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            payment.status = 'failed'
            payment.save()
            
            print(f"Error initiating Khalti payment: {str(e)}")
            return Response({
                "detail": f"Error initiating payment: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    #Verify Khalti payment
    @action(detail=False, methods=['post'], url_path='verify-khalti')
    def verify_khalti_payment(self, request):
        serializer = PaymentVerifySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        pidx = serializer.validated_data['pidx']
        
        try:
            payment = Payment.objects.get(pidx=pidx)
            
            # Make request to Khalti API to verify payment
            headers = {
                "Authorization": f"Key {settings.KHALTI_SECRET_KEY}"
            }
            
            try:
                response = requests.post(
                    f"{settings.KHALTI_API_URL}/epayment/lookup/", 
                    headers=headers,
                    data={"pidx": pidx}
                )
                
                response_data = response.json()
                print(f"Khalti verification response: {response_data}")
                
                if response.status_code == 200 and response_data.get("status") == "Completed":
                    # Update payment status to completed
                    payment.status = 'completed'
                    payment.save()
                    
                    return Response({
                        "status": "success",
                        "message": "Payment verified successfully",
                        "payment": PaymentSerializer(payment).data
                    }, status=status.HTTP_200_OK)
                else:
                    # Update payment status based on Khalti response
                    payment.status = 'failed'
                    payment.save()
                    
                    return Response({
                        "status": "failed",
                        "message": "Payment verification failed",
                        "payment": PaymentSerializer(payment).data,
                        "khalti_response": response_data
                    }, status=status.HTTP_400_BAD_REQUEST)
                    
            except Exception as e:
                print(f"Error verifying Khalti payment: {str(e)}")
                return Response({
                    "detail": f"Error verifying payment: {str(e)}"
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except Payment.DoesNotExist:
            return Response({
                "status": "error",
                "message": "Payment not found"
            }, status=status.HTTP_404_NOT_FOUND)