import requests
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

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
            "X-Custom-Debug": "TestHeader"  # Optional custom header
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
            "X-Custom-Debug": "TestHeader"  # Optional custom header
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