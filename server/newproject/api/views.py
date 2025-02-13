from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Book
from .serializer import BookSerializer

#Api view decorator @api_view defiens kind of request
@api_view(['GET']) #get request is for getting data
def get_books(request):
    books = Book.objects.all()
    serializedData = BookSerializer(books, many=True).data
    return Response(serializedData)

@api_view(['POST']) #post request is for creating or changing data, need to add to api urls in urls.py
def create_book(request):
    data = request.data #access the data from the request
    serializer = BookSerializer(data=data) #serialize the data
    if serializer.is_valid():
        serializer.save() #save the data to database - if it is valid
        return Response(serializer.data, status=status.HTTP_201_CREATED) #return the data and status confirming it worked
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT', 'DELETE']) #put request is for updating data, delete request is for deleting data
def book_detail(request, pk):
    try:
        book = Book.objects.get(pk=pk)  # Attempt to retrieve the book by its primary key
    except Book.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)  # Return 404 if the book isn't found

    if request.method == 'PUT':
        data=request.data # Get the updated data from the request
        serializer = BookSerializer(book, data)  # Initialize the serializer with the existing book and updated data
        if serializer.is_valid():
            serializer.save()  # Save the updated data if validation is successful
            return Response(serializer.data)  # Return the updated book data
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)  # Return validation errors with a 400 status

    elif request.method == 'DELETE':
        book.delete()  # Delete the book from the database
        return Response(status=status.HTTP_204_NO_CONTENT)  # Return a 204 status to indicate successful deletion
