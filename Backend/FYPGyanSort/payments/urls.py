from django.urls import path
from .views import (
    initiate_khalti_payment,
    verify_khalti_payment,
    initiate_esewa_payment,
    verify_esewa_payment,
    esewa_success,
    esewa_failure,
)

urlpatterns = [
    path("initiate-khalti/", initiate_khalti_payment, name="initiate-khalti"),
    path("verify-khalti/", verify_khalti_payment, name="verify-khalti"),
    path('initiate-esewa/', initiate_esewa_payment, name="initiate-esewa"),
    path('verify-esewa/', verify_esewa_payment, name="verify-esewa"),
    path('esewa-success/', esewa_success, name="esewa-success"),
    path('esewa-failure/', esewa_failure, name="esewa-failure"),
]