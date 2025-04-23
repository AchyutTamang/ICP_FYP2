from rest_framework import serializers
from .models import Payment

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ('transaction_id', 'status', 'created_at', 'updated_at', 'pidx')

class PaymentInitiateSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    product_name = serializers.CharField(max_length=255, required=False, default="GyanSort Course")
    description = serializers.CharField(required=False, allow_blank=True)
    return_url = serializers.URLField(required=False)
    
class PaymentVerifySerializer(serializers.Serializer):
    pidx = serializers.CharField()
    transaction_id = serializers.CharField(required=False)
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)