from django.db import models

# models.Models is how you use the Django model class to create a model
class Book(models.Model):
    title = models.CharField(max_length=100) #set to string with charfield
    release_year = models.IntegerField() #set to integer with integerfield

    def __str__(self): #this is a string representation of the model
        return self.title #return the title of the book
    
