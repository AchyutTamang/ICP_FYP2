from django.urls import path
from .views import initiate_khalti_payment, verify_khalti_payment

urlpatterns = [
    path("initiate-khalti/", initiate_khalti_payment, name="initiate-khalti"),
    path("verify-khalti/", verify_khalti_payment, name="verify-khalti"),
]