/**
 * [
 *    {
  id: string | number,
  title: string,
  author: string,
  year: number,
  isComplete: boolean,
}
 * ]
 */
const array = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOKSHELF-APPS";

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isCompleted) {
  return {
    id,
    title,
    author,
    year,
    isCompleted,
  };
}

function findBook(bookId) {
  for (const bookItem of array) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (const index in array) {
    if (array[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

/**
 * Fungsi ini digunakan untuk memeriksa apakah localStorage didukung oleh browser atau tidak
 *
 * @returns boolean
 */
function isStorageExist() /* boolean */ {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

/**
 * Fungsi ini digunakan untuk menyimpan data ke localStorage
 * berdasarkan KEY yang sudah ditetapkan sebelumnya.
 */
function saveData() {
  if (isStorageExist()) {
    const parsed /* string */ = JSON.stringify(array);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

/**
 * Fungsi ini digunakan untuk memuat data dari localStorage
 * Dan memasukkan data hasil parsing ke variabel {@see array}
 */
function loadDataFromStorage() {
  const serializedData /* string */ = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      array.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function makeBook(bookObject) {
  const { id, title, author, year, isCompleted } = bookObject;

  const textTitle = document.createElement("h3");
  textTitle.innerText = title;

  const textAuthor = document.createElement("p");
  textAuthor.innerText = author;

  const textYear = document.createElement("p");
  textYear.innerText = year;

  const textContainer = document.createElement("div");
  textContainer.classList.add("action");

  const container = document.createElement("article");
  container.classList.add("book_item");
  container.appendChild(textTitle);
  container.appendChild(textAuthor);
  container.appendChild(textYear);
  container.append(textContainer);
  container.setAttribute("id", `book-${id}`);

  if (isCompleted) {
    const undoButton = document.createElement("button");
    undoButton.classList.add("undo-button");
    undoButton.innerText = "Belum Selesai dibaca";
    undoButton.addEventListener("click", function () {
      undoTaskFromCompleted(id);
    });

    const trashButton = document.createElement("button");
    trashButton.classList.add("red");
    trashButton.innerText = "Hapus";
    trashButton.addEventListener("click", function () {
      removeTaskFromCompleted(id);
    });

    textContainer.append(undoButton, trashButton);
  } else {
    const checkButton = document.createElement("button");
    checkButton.classList.add("green");
    checkButton.innerText = "Selesai dibaca";
    checkButton.addEventListener("click", function () {
      addTaskToCompleted(id);
    });

    const trashButton = document.createElement("button");
    trashButton.classList.add("red");
    trashButton.innerText = "Hapus";
    trashButton.addEventListener("click", function () {
      removeTaskFromCompleted(id);
    });
    textContainer.append(checkButton, trashButton);
  }

  return container;
}

function addBook() {
  const textBook = document.getElementById("inputBookTitle").value;
  const textAuthor = document.getElementById("inputBookAuthor").value;
  const textYear = document.getElementById("inputBookYear").value;
  const bookIsComplete = document.getElementById("inputBookIsComplete").checked;
  const generatedID = generateId();
  const bookObject = generateBookObject(
    generatedID,
    textBook,
    textAuthor,
    textYear,
    bookIsComplete,
    false
  );
  array.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function addTaskToCompleted(bookId /* HTMLELement */) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function removeTaskFromCompleted(bookId /* HTMLELement */) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  array.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoTaskFromCompleted(bookId /* HTMLELement */) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;

  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

// Fitur Pencarian
document
  .getElementById("searchBook")
  .addEventListener("submit", function (event) {
    const searchBOOK = document
      .getElementById("searchBookTitle")
      .value.toLowerCase();

    const bookList = document.querySelectorAll(".book_item > h3");

    for (book of bookList) {
      if (book.innerText.toLowerCase().includes(searchBOOK)) {
        book.parentElement.style.display = "block";
      } else {
        book.parentElement.style.display = "none";
      }
    }
    event.preventDefault();
  });

document.addEventListener("DOMContentLoaded", function () {
  const submitForm /* HTMLFormElement */ = document.getElementById("inputBook");

  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.addEventListener(SAVED_EVENT, () => {
  console.log("Data berhasil di simpan.");
});

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedBookList = document.getElementById(
    "incompleteBookshelfList"
  );
  const listCompleted = document.getElementById("completeBookshelfList");

  // clearing list item
  uncompletedBookList.innerHTML = "";
  listCompleted.innerHTML = "";

  for (const bookItem of array) {
    const bookElement = makeBook(bookItem);
    if (bookItem.isCompleted) {
      listCompleted.append(bookElement);
    } else {
      uncompletedBookList.append(bookElement);
    }
  }
});
