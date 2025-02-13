from rest_framework import serializers
from .models import Book
#this class is going to be used to transfer json data into python data
class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = '__all__' #this will take all the fields in the model and serialize them