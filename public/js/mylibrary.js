document.addEventListener("DOMContentLoaded", () => {
    const bookList = document.getElementById("book-list");
    const viewToggle = document.getElementById("viewToggle");
    const searchInput = document.getElementById("searchInput");

    let allBooks = [];

    fetch(`user-books`)
        .then(res => res.json())
        .then(data => {
            if (data.read_books) {
                data.read_books.forEach(book => allBooks.push({ ...book, status: "Read" }));
            }
            if (data.to_read_books) {
                data.to_read_books.forEach(book => allBooks.push({ ...book, status: "To Read" }));
            }
            renderBooks();
        })
        .catch(err => {
            console.error("Error fetching books:", err);
        });

    function renderBooks() {
        const parent = bookList.parentElement;
        parent.innerHTML = "";

        if (viewToggle.checked) {
            const container = document.createElement("div");
            container.className = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6";

            allBooks.forEach(book => {
                const card = document.createElement("div");
                card.className = "bg-white shadow rounded-lg p-4";

                card.innerHTML = `
                    <img src="${book.cover || '#'}" alt="Cover" class="mx-auto mb-2 rounded">
                    <h2 class="text-md font-bold text-center">${book.title}</h2>
                    <p class="text-sm text-gray-600 text-center mb-2">${book.author}</p>
                    <div class="flex justify-center items-center mb-2">
                        <span class="text-yellow-500">⭐️⭐️⭐️⭐️</span>
                        <span class="ml-2 text-sm text-gray-600">No Rating</span>
                    </div>
                    <div class="flex justify-between space-x-2 mb-2">
                        <button class="btn-read flex-1 bg-green-500 text-white py-1 rounded hover:bg-green-600 flex items-center justify-center">
                            ✅ <span class="ml-1">Read</span>
                        </button>
                        <button class="btn-to-read flex-1 bg-blue-500 text-white py-1 rounded hover:bg-blue-600 flex items-center justify-center">
                            📚 <span class="ml-1">To Read</span>
                        </button>
                    </div>
                    <button class="w-full bg-indigo-600 text-white py-1 rounded hover:bg-indigo-700">Details</button>
                `;
                container.appendChild(card);
            });

            parent.appendChild(container);
        } else {
            const table = document.createElement("table");
            table.className = "table table-bordered table-striped w-full";
            table.style.tableLayout = "fixed";

            const thead = document.createElement("thead");
            thead.innerHTML = `
                <tr>
                    <th>📕 Cover</th>
                    <th>📘 Title</th>
                    <th>👤 Author</th>
                    <th>🏷 Genre</th>
                    <th>📅 Year</th>
                    <th>📄 Pages</th>
                    <th>📖 Status</th>
                </tr>
            `;

            const tbody = document.createElement("tbody");
            tbody.id = "book-list";

            allBooks.forEach(book => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td><img src="${book.cover || '#'}" alt="Cover" style="width: 60px; height: auto;" /></td>
                    <td>${book.title}</td>
                    <td>${book.author}</td>
                    <td>${book.genre}</td>
                    <td>${book.year}</td>
                    <td>${book.pages}</td>
                    <td>${book.status}</td>
                `;
                tbody.appendChild(row);
            });

            table.appendChild(thead);
            table.appendChild(tbody);
            parent.appendChild(table);
        }

        applySearchFilter();
    }

    viewToggle.addEventListener("change", renderBooks);

    searchInput.addEventListener("input", applySearchFilter);

    function applySearchFilter() {
        const term = searchInput.value.toLowerCase();

        if (!viewToggle.checked) {
            const rows = document.querySelectorAll("#book-list tr");
            rows.forEach(row => {
                const text = row.innerText.toLowerCase();
                row.style.display = text.includes(term) ? "" : "none";
            });
        } else {
            const cards = document.querySelectorAll("main .grid > div");
            cards.forEach(card => {
                const text = card.innerText.toLowerCase();
                card.style.display = text.includes(term) ? "" : "none";
            });
        }
    }

    document.getElementById("addBookBtn").addEventListener("click", () => {
        window.location.href = "add-book.html";
    });
});