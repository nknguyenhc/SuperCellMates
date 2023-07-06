from django.db.models import DateTimeField

class DateTimeFieldNTZ(DateTimeField):
    def db_type(self, connection):
        return 'timestamp'