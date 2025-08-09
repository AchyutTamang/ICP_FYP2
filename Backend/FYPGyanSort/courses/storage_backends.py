from storages.backends.s3boto3 import S3Boto3Storage

class CourseVideoS3Storage(S3Boto3Storage):
    location = 'course_content_videos'  # S3 folder prefix
    default_acl = None  # Or None, as needed