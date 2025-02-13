import { useEffect, useState } from "react"; // State is a way for us to hold data that will manually trigger
// a re-render of the component when it changes
import "./App.css";

function App() {
  useEffect(() => {
    // useEffect is a hook that allows us to run side effects in functional components
    fetchBooks();
  }, []); //empty array as lasy argument means that the effect will only run once (on render of webpage)

  // useState is a hook that allows us to add state to our functional components
  // useState returns an array with two elements: the current state value and a function that allows us to update the state value
  const [books, setBooks] = useState([]);
  //state for each of inputs
  const [title, setTitle] = useState("");
  const [releaseYear, setReleaseYear] = useState(0);

  //for updating title
  const [newTitle, setNewTitle] = useState("");

  const fetchBooks = async () => {
    try {
      //make an api request to get all the books
      const response = await fetch("http://localhost:8000/api/books/"); // fetch is a built-in function that allows us to make network requests
      const data = await response.json(); //structuring the data in json format
      setBooks(data);
    } catch (error) {
      console.error(error);
    }
  };

  const addBook = async () => {
    const bookData = {
      title, //when an object has a key and value with the same name, we can use shorthand syntax
      release_year: releaseYear, //in the python code, the key is release_year, so we need to use the same key here
    };
    try {
      const response = await fetch("http://localhost:8000/api/books/create/", {
        method: "POST", // POST is used to send data to the server
        headers: {
          "Content-Type": "application/json", // Specifying the format of the data we are sending
        },
        body: JSON.stringify(bookData), // Converts a JavaScript object or value to a JSON string
      });
      const data = await response.json();
      setBooks((prevBooks) => [data, ...prevBooks]); // New book added first, followed by previous entries
    } catch (error) {
      console.error("Error adding book:", error);
    }
  };

  /*
    updateTitle function logic:
    1. Constructs an object (bookData) containing the new title (from state) and the existing release year.
    2. Makes a PUT request to the backend at the endpoint for updating a specific book using its id (pk).
    3. Upon a successful response, it updates the local books state by replacing the book with the updated data.
    4. Logs any errors encountered during the update process.
  */
  const updateTitle = async (pk, releaseYear) => {
    const bookData = {
      title: newTitle,
      release_year: releaseYear,
    };
    try {
      const response = await fetch(`http://localhost:8000/api/books/${pk}/`, {
        method: "PUT", // PUT is used to update data on the server
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookData),
      });
      const data = await response.json();
      setBooks((prev) =>
        prev.map((book) => {
          if (book.id === pk) {
            //if the book id matches the id of the book we want to update
            //how to update a specific item based on its id
            return data;
          } else {
            //if the book id does not match the id of the book we want to update
            return book; //return the book as it is
          }
        })
      );
    } catch (error) {
      console.error("Error updating book:", error);
    }
  };

  const deleteBook = async (pk) => {
    try {
      await fetch(`http://localhost:8000/api/books/${pk}/`, {
        method: "DELETE", // DELETE is used to delete data on the server
      });
      setBooks((prev) => prev.filter((book) => book.id !== pk)); //filtering out the book with the id that we want to delete
    } catch (error) {
      console.error("Error deleting book:", error);
    }
  };
  return (
    <>
      <h1>Book Website</h1>

      {/* the div below is the inputing the books into the data base,
      clicking button is sending request to api
      */}
      <div>
        <input
          type="text"
          placeholder="Book title..."
          onChange={(e) => setTitle(e.target.value)} //onChange is an event that is triggered when the value of an input changes
        />
        <input
          type="text"
          placeholder="Release Year..."
          onChange={(e) => setReleaseYear(e.target.value)}
        />
        <button onClick={addBook}>Add Book</button>
      </div>
      {books.map((book) => (
        <div key={book.id}>
          <h2>Title: {book.title}</h2>
          <p>Release Year: {book.release_year}</p>
          <input
            type="text"
            placeholder="New Title..."
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <button onClick={() => updateTitle(book.id, book.release_year)}>
            Change title
          </button>
          <button onClick={() => deleteBook(book.id)}>Delete</button>
        </div>
      ))}
    </>
  );
}

export default App;
