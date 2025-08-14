import time
import requests
from django.conf import settings
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .models import EsewaPayment

# Utility: Generate a unique pid for every payment attempt
def make_unique_pid(user_id, product_id, amount):
    return f"{user_id}-{product_id}-{amount}-{int(time.time() * 1000)}"

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def initiate_esewa_payment(request):
    """
    Initiates eSewa payment, returns redirect URL
    """
    try:
        total_amount = int(request.data.get('amount'))
        product_id = request.data.get('product_id')
        transaction_uuid = make_unique_pid(request.user.id, product_id, total_amount)
        product_code = getattr(settings, 'ESEWA_MERCHANT_CODE', 'EPAYTEST')

        payment = EsewaPayment.objects.create(
            user_email=request.user.email,
            user_id=request.user.id,
            product_id=product_id,
            transaction_uuid=transaction_uuid,
            amount=total_amount,
            status='pending',
            created_at=timezone.now(),
            updated_at=timezone.now(),
        )

        params = {
            "amt": total_amount,
            "pdc": 0,
            "psc": 0,
            "txAmt": 0,
            "tAmt": total_amount,
            "pid": transaction_uuid,
            "scd": product_code,
            # "su": getattr(settings, 'ESEWA_SUCCESS_URL', 'https://YOUR_PUBLIC_DOMAIN/esewa-success/'),
            # "fu": getattr(settings, 'ESEWA_FAILURE_URL', 'https://YOUR_PUBLIC_DOMAIN/esewa-failure/'),
            "su": settings.ESEWA_SUCCESS_URL,
            "fu": settings.ESEWA_FAILURE_URL,
        }
        esewa_url = "https://rc.esewa.com.np/epay/main"
        redirect_url = f"{esewa_url}?" + '&'.join([f"{k}={v}" for k, v in params.items()])

        return Response({
            "redirect_url": redirect_url,
            "payment_id": payment.id,
        })
    except Exception as e:
        print("Error in initiate_esewa_payment:", str(e))
        return Response({"error": "Failed to initiate eSewa payment.", "detail": str(e)}, status=500)

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def esewa_success(request):
    """
    Handle eSewa success URL.
    Always verify payment with eSewa before marking success.
    """
    print("HIT: esewa_success")
    amt = request.GET.get('amt') or request.POST.get('amt')
    oid = request.GET.get('oid') or request.POST.get('oid')    # pid/transaction_uuid
    ref_id = request.GET.get('refId') or request.POST.get('refId')
    product_code = getattr(settings, 'ESEWA_MERCHANT_CODE', 'EPAYTEST')

    # Verify with eSewa
    url = "https://esewa.com.np/epay/transrec"
    params = {
        "amt": amt,
        "scd": product_code,
        "pid": oid,
        "rid": ref_id,
    }
    esewa_response = requests.post(url, data=params)
    result = esewa_response.text
    print("eSewa verify response (success):", result)

    try:
        payment = EsewaPayment.objects.get(transaction_uuid=oid)
        payment.status = "success" if "Success" in result else "failed"
        payment.ref_id = ref_id
        payment.raw_response = result
        payment.updated_at = timezone.now()
        payment.save()
        print(f"Updated EsewaPayment {payment.id} status to {payment.status}")
    except EsewaPayment.DoesNotExist:
        print(f"EsewaPayment with transaction_uuid {oid} not found")

    return Response({
        "payment_status": "success" if "Success" in result else "failed",
        "raw_esewa_response": result,
    })

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def esewa_failure(request):
    """
    Handle eSewa failure/cancel URL.
    """
    print("HIT: esewa_failure")
    amt = request.GET.get('amt') or request.POST.get('amt')
    oid = request.GET.get('oid') or request.POST.get('oid')
    ref_id = request.GET.get('refId') or request.POST.get('refId')

    try:
        payment = EsewaPayment.objects.get(transaction_uuid=oid)
        payment.status = "failed"
        payment.ref_id = ref_id
        payment.updated_at = timezone.now()
        payment.save()
        print(f"Updated EsewaPayment {payment.id} status to failed")
    except EsewaPayment.DoesNotExist:
        print(f"EsewaPayment with transaction_uuid {oid} not found")

    return Response({
        "payment_status": "failed"
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_esewa_payment(request):
    """
    Verifies eSewa payment status using server-to-server verification.
    """
    ref_id = request.data.get('refId')
    pid = request.data.get('pid')
    amt = request.data.get('amt')
    payment_id = request.data.get('payment_id')
    url = "https://esewa.com.np/epay/transrec"
    params = {
        "amt": amt,
        "scd": getattr(settings, 'ESEWA_MERCHANT_CODE', 'EPAYTEST'),
        "pid": pid,
        "rid": ref_id,
    }
    esewa_response = requests.post(url, data=params)
    result = esewa_response.text

    try:
        payment = EsewaPayment.objects.get(id=payment_id)
        payment.status = "success" if "Success" in result else "failed"
        payment.ref_id = ref_id
        payment.raw_response = result
        payment.updated_at = timezone.now()
        payment.save()
    except EsewaPayment.DoesNotExist:
        pass

    return Response({"raw_esewa_response": result})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def initiate_khalti_payment(request):
    """
    Initiates Khalti payment.
    Expects: amount, product_name, description, return_url in request.data
    """
    print("Khalti Secret Key being used for API call:", settings.KHALTI_SECRET_KEY)

    try:
        amount = int(request.data.get('amount'))
        product_name = request.data.get('product_name')
        description = request.data.get('description', '')
        return_url = request.data.get('return_url')
        website_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173")

        # Basic validation
        if not all([amount, product_name, return_url]):
            return Response({"error": "Missing required fields."}, status=400)

        url = 'https://khalti.com/api/v2/epayment/initiate/'
        payload = {
            "return_url": return_url,
            "website_url": website_url,
            "amount": amount,
            "purchase_order_id": f"{request.user.id}-{product_name}-{amount}",
            "purchase_order_name": product_name,
            "customer_info": {
                "name": getattr(request.user, "fullname", request.user.email),
                "email": request.user.email,
            },
            "amount_details": [
                {
                    "label": "Total",
                    "amount": amount
                }
            ],
            "product_details": [
                {
                    "identity": product_name,
                    "name": product_name,
                    "total_price": amount,
                    "quantity": 1,
                    "unit_price": amount,
                    "description": description
                }
            ]
        }
        headers = {
            "Authorization": f"Key {settings.KHALTI_SECRET_KEY}",
            "Content-Type": "application/json",
            "X-Custom-Debug": "TestHeader"
        }

        response = requests.post(url, json=payload, headers=headers)
        print("Khalti API Response Status:", response.status_code)
        print("Khalti API Response Body:", response.text)

        try:
            resp_data = response.json()
        except Exception:
            resp_data = {}

        payment_url = resp_data.get("payment_url")
        if payment_url:
            return Response({
                "payment_url": payment_url,
                "raw_khalti_response": resp_data,
            }, status=response.status_code)
        else:
            error_detail = resp_data.get("detail", "Khalti payment initiation failed.")
            return Response({
                "error": error_detail,
                "raw_khalti_response": resp_data,
            }, status=response.status_code)

    except Exception as e:
        print("Error in initiate_khalti_payment:", str(e))
        return Response({"error": "Internal server error.", "detail": str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_khalti_payment(request):
    """
    Verifies Khalti payment.
    Expects: pidx in request.data
    """
    try:
        pidx = request.data.get('pidx')
        if not pidx:
            return Response({"error": "Missing pidx."}, status=400)
        url = "https://khalti.com/api/v2/epayment/lookup/"
        payload = { "pidx": pidx }
        headers = {
            "Authorization": f"Key {settings.KHALTI_SECRET_KEY}",
            "Content-Type": "application/json",
            "X-Custom-Debug": "TestHeader"
        }
        response = requests.post(url, json=payload, headers=headers)
        print("Khalti Verify Response Status:", response.status_code)
        print("Khalti Verify Response Body:", response.text)
        try:
            data = response.json()
        except Exception:
            data = {}
        return Response(data, status=response.status_code)
    except Exception as e:
        print("Error in verify_khalti_payment:", str(e))
        return Response({"error": "Internal server error.", "detail": str(e)}, status=500)