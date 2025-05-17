document.addEventListener("DOMContentLoaded", () => {
    const bookList = document.getElementById("book-list");
    const viewToggle = document.getElementById("viewToggle");
    const searchInput = document.getElementById("searchInput");

    fetch(`user-books`)
        .then(res => res.json())
        .then(data => {
            if (data.read_books) {
                data.read_books.forEach(book => addBookToTable(book, "Read"));
            }
            if (data.to_read_books) {
                data.to_read_books.forEach(book => addBookToTable(book, "To Read"));
            }
        })
        .catch(err => {
            console.error("Error fetching books:", err);
        });

    function addBookToTable(book, status) {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td><img src="${book.cover || '#'}" alt="Cover" style="width: 60px; height: auto;" /></td>
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.genre}</td>
            <td>${book.year}</td>
            <td>${book.pages}</td>
            <td>${status}</td>
        `;

        bookList.appendChild(row);
    }

    searchInput.addEventListener("input", () => {
        const term = searchInput.value.toLowerCase();
        const rows = bookList.querySelectorAll("tr");

        rows.forEach(row => {
            const text = row.innerText.toLowerCase();
            row.style.display = text.includes(term) ? "" : "none";
        });
    });

    // viewToggle.addEventListener("change", () => {
    //     viewToggle.checked = false;
    // });

    // document.getElementById("addBookBtn").addEventListener("click", () => {
    // });
});