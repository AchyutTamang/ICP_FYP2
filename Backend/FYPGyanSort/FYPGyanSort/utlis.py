import boto3
import os
from django.conf import settings
import uuid

class CloudFrontManager:
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME
        )
        self.cloudfront_client = boto3.client(
            'cloudfront',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME
        )
        self.bucket_name = settings.AWS_STORAGE_BUCKET_NAME
        self.cloudfront_domain = settings.CLOUDFRONT_DOMAIN

    def upload_file(self, file_path, content_type):
        """Upload a file to S3 and return the CloudFront URL"""
        file_name = os.path.basename(file_path)
        unique_filename = f"{uuid.uuid4()}-{file_name}"
        
        # Upload to S3
        with open(file_path, 'rb') as file_data:
            self.s3_client.upload_fileobj(
                file_data,
                self.bucket_name,
                unique_filename,
                ExtraArgs={
                    'ContentType': content_type
                }
            )
        
        # Return CloudFront URL
        return f"https://{self.cloudfront_domain}/{unique_filename}"

    def generate_signed_url(self, object_key, expiration=3600):
        """Generate a signed URL for private content"""
        return self.cloudfront_client.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': self.bucket_name,
                'Key': object_key
            },
            ExpiresIn=expiration
        )