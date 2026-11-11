
// ======================================
// 1. SAMPLE DATA
// ======================================

let books = JSON.parse(localStorage.getItem("books")) || [
    {
        id: 101,
        title: "Introduction to JavaScript",
        author: "Jon Duckett",
        category: "Programming",
        quantity: 10,
        available: 8
    },
    {
        id: 102,
        title: "Database System Concepts",
        author: "Abraham Silberschatz",
        category: "Database",
        quantity: 8,
        available: 6
    },
    {
        id: 103,
        title: "Clean Code",
        author: "Robert C. Martin",
        category: "Programming",
        quantity: 5,
        available: 4
    }
];

let members = JSON.parse(localStorage.getItem("members")) || [
    {
        id: 201,
        name: "Abebe Kebede",
        email: "abebe@gmail.com",
        phone: "0912345678"
    },
    {
        id: 202,
        name: "Hana Getachew",
        email: "hana@gmail.com",
        phone: "0923456789"
    },
    {
        id: 203,
        name: "Dawit Tadesse",
        email: "dawit@gmail.com",
        phone: "0934567890"
    }
];

let borrowings = JSON.parse(localStorage.getItem("borrowings")) || [
    {
        id: 301,
        bookId: 101,
        memberId: 201,
        borrowDate: "2026-11-09",
        dueDate: "2026-11-12",
        returnDate: null
    },
    {
        id: 302,
        bookId: 102,
        memberId: 202,
        borrowDate: "2026-11-05",
        dueDate: "2026-11-08",
        returnDate: null
    }
];

// ======================================
// 2. SAVE DATA
// ======================================

function saveData() {

    localStorage.setItem("books", JSON.stringify(books));

    localStorage.setItem("members", JSON.stringify(members));

    localStorage.setItem("borrowings", JSON.stringify(borrowings));

}

// ======================================
// 3. HELPER FUNCTIONS
// ======================================

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function getBook(id) {
    return books.find(book => book.id === Number(id));
}

function getMember(id) {
    return members.find(member => member.id === Number(id));
}

function getBorrowStatus(record) {

    if (record.returnDate) return "Returned";

    // Compare date strings using YYYY-MM-DD format
    if (record.dueDate < new Date().toISOString().slice(0, 10)) {
        return "Overdue";
    }

    return "Borrowed";
}

// ======================================
// 4. PAGE NAVIGATION
// ======================================

function showPage(pageId) {

    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    document.getElementById(pageId).classList.add("active");

    document.querySelectorAll("[data-page]").forEach(link => {

        link.classList.remove("active");

        if (link.dataset.page === pageId) {
            link.classList.add("active");
        }

    });

    const titles = {
        dashboard: "Dashboard",
        books: "Books Management",
        members: "Members Management",
        borrowing: "Borrowing Management",
        returns: "Book Returns",
        reports: "Library Reports",
        settings: "Settings"
    };

    document.getElementById("pageTitle").textContent = titles[pageId];

    document.querySelector(".sidebar").classList.remove("open");
}

document.querySelectorAll("[data-page]").forEach(link => {

    link.addEventListener("click", function(e) {

        e.preventDefault();

        showPage(this.dataset.page);

    });

});

document.getElementById("menuBtn").addEventListener("click", () => {

    document.querySelector(".sidebar").classList.toggle("open");

});

// ======================================
// 5. DASHBOARD STATISTICS
// ======================================

function updateDashboard() {

    const active = borrowings.filter(b => !b.returnDate);

    const overdue = active.filter(b => getBorrowStatus(b) === "Overdue");

    document.getElementById("totalBooks").textContent =
        books.reduce((sum, book) => sum + book.quantity, 0);

    document.getElementById("totalMembers").textContent =
        members.length;

    document.getElementById("borrowedBooks").textContent =
        active.length;

    document.getElementById("overdueBooks").textContent =
        overdue.length;

    document.getElementById("reportBooks").textContent =
        books.reduce((sum, book) => sum + book.quantity, 0);

    document.getElementById("reportMembers").textContent =
        members.length;

    document.getElementById("reportReturns").textContent =
        borrowings.filter(b => b.returnDate).length;

    document.getElementById("reportBorrowings").textContent =
        borrowings.length;

    renderRecentBorrowings();

}

// ======================================
// 6. BOOK MANAGEMENT
// ======================================

function renderBooks(search = "") {

    const table = document.getElementById("bookTable");

    const filtered = books.filter(book =>

        book.title.toLowerCase().includes(search.toLowerCase()) ||

        book.author.toLowerCase().includes(search.toLowerCase()) ||

        book.category.toLowerCase().includes(search.toLowerCase())

    );

    if (filtered.length === 0) {
        table.innerHTML = `<tr><td colspan="7">No books found.</td></tr>`;
        return;
    }

    table.innerHTML = filtered.map(book => `

        <tr>

            <td>${book.id}</td>

            <td>${escapeHTML(book.title)}</td>

            <td>${escapeHTML(book.author)}</td>

            <td>${escapeHTML(book.category)}</td>

            <td>${book.quantity}</td>

            <td>${book.available}</td>

            <td>

                <button class="action-btn"
                    onclick="editBook(${book.id})">
                    <i class="fas fa-edit"></i>
                </button>

                <button class="action-btn delete-btn"
                    onclick="deleteBook(${book.id})">
                    <i class="fas fa-trash"></i>
                </button>

            </td>

        </tr>

    `).join("");

}

// Open book form
function openBookForm() {

    document.getElementById("bookFormCard").hidden = false;

    document.getElementById("bookFormTitle").textContent = "Add New Book";

    document.getElementById("bookForm").reset();

    document.getElementById("editBookId").value = "";

}

document.getElementById("addBookBtn").addEventListener("click", openBookForm);

// Save book
document.getElementById("bookForm").addEventListener("submit", function(e) {

    e.preventDefault();

    const editId = Number(document.getElementById("editBookId").value);

    const title = document.getElementById("bookTitle").value.trim();
    const author = document.getElementById("bookAuthor").value.trim();
    const category = document.getElementById("bookCategory").value.trim();
    const quantity = Number(document.getElementById("bookQuantity").value);

    if (quantity < 1 || !Number.isInteger(quantity)) {
        alert("Quantity must be a positive whole number.");
        return;
    }

    if (editId) {

        const book = getBook(editId);

        const borrowedCount = book.quantity - book.available;

        if (quantity < borrowedCount) {
            alert("Quantity cannot be less than the number of borrowed copies.");
            return;
        }

        book.title = title;
        book.author = author;
        book.category = category;
        book.quantity = quantity;
        book.available = quantity - borrowedCount;

    } else {

        books.push({
            id: Date.now(),
            title,
            author,
            category,
            quantity,
            available: quantity
        });

    }

    saveData();

    refreshAll();

    document.getElementById("bookFormCard").hidden = true;

    this.reset();

    alert("Book saved successfully!");

});

// Edit book
function editBook(id) {

    const book = getBook(id);

    if (!book) return;

    document.getElementById("bookFormCard").hidden = false;

    document.getElementById("bookFormTitle").textContent = "Edit Book";

    document.getElementById("editBookId").value = book.id;

    document.getElementById("bookTitle").value = book.title;

    document.getElementById("bookAuthor").value = book.author;

    document.getElementById("bookCategory").value = book.category;

    document.getElementById("bookQuantity").value = book.quantity;

    showPage("books");

}

// Delete book
function deleteBook(id) {

    const book = getBook(id);

    if (!book) return;

    const hasBorrowings = borrowings.some(b =>
        b.bookId === id && !b.returnDate
    );

    if (hasBorrowings) {
        alert("This book cannot be deleted while copies are borrowed.");
        return;
    }

    if (!confirm("Delete this book?")) return;

    books = books.filter(b => b.id !== id);

    saveData();

    refreshAll();

}

document.getElementById("cancelBook").addEventListener("click", () => {

    document.getElementById("bookFormCard").hidden = true;

    document.getElementById("bookForm").reset();

});

// Search books
document.getElementById("searchBook").addEventListener("input", function() {

    renderBooks(this.value);

});

// ======================================
// 7. MEMBER MANAGEMENT
// ======================================

function renderMembers(search = "") {

    const table = document.getElementById("memberTable");

    const filtered = members.filter(member =>

        member.name.toLowerCase().includes(search.toLowerCase()) ||

        member.email.toLowerCase().includes(search.toLowerCase())

    );

    if (filtered.length === 0) {
        table.innerHTML = `<tr><td colspan="5">No members found.</td></tr>`;
        return;
    }

    table.innerHTML = filtered.map(member => `

        <tr>

            <td>${member.id}</td>

            <td>${escapeHTML(member.name)}</td>

            <td>${escapeHTML(member.email)}</td>

            <td>${escapeHTML(member.phone)}</td>

            <td>

                <button class="action-btn"
                    onclick="editMember(${member.id})">
                    <i class="fas fa-edit"></i>
                </button>

                <button class="action-btn delete-btn"
                    onclick="deleteMember(${member.id})">
                    <i class="fas fa-trash"></i>
                </button>

            </td>

        </tr>

    `).join("");

}

function openMemberForm() {

    document.getElementById("memberFormCard").hidden = false;

    document.getElementById("memberFormTitle").textContent = "Register New Member";

    document.getElementById("memberForm").reset();

    document.getElementById("editMemberId").value = "";

}

document.getElementById("addMemberBtn").addEventListener("click", openMemberForm);

// Save member
document.getElementById("memberForm").addEventListener("submit", function(e) {

    e.preventDefault();

    const editId = Number(document.getElementById("editMemberId").value);

    const name = document.getElementById("memberName").value.trim();
    const email = document.getElementById("memberEmail").value.trim();
    const phone = document.getElementById("memberPhone").value.trim();

    const duplicate = members.some(m =>
        m.email.toLowerCase() === email.toLowerCase() && m.id !== editId
    );

    if (duplicate) {
        alert("This email is already registered.");
        return;
    }

    if (editId) {

        const member = getMember(editId);

        if (member) Object.assign(member, { name, email, phone });

    } else {

        members.push({
            id: Date.now(),
            name,
            email,
            phone
        });

    }

    saveData();

    refreshAll();

    document.getElementById("memberFormCard").hidden = true;

    this.reset();

    alert("Member saved successfully!");

});

// Edit member
function editMember(id) {

    const member = getMember(id);

    if (!member) return;

    document.getElementById("memberFormCard").hidden = false;

    document.getElementById("memberFormTitle").textContent = "Edit Member";

    document.getElementById("editMemberId").value = member.id;

    document.getElementById("memberName").value = member.name;

    document.getElementById("memberEmail").value = member.email;

    document.getElementById("memberPhone").value = member.phone;

    showPage("members");

}

// Delete member
function deleteMember(id) {

    const hasBorrowings = borrowings.some(b =>
        b.memberId === id && !b.returnDate
    );

    if (hasBorrowings) {
        alert("This member has borrowed books. Return them before deleting.");
        return;
    }

    if (!confirm("Delete this member?")) return;

    members = members.filter(m => m.id !== id);

    saveData();

    refreshAll();

}

document.getElementById("cancelMember").addEventListener("click", () => {

    document.getElementById("memberFormCard").hidden = true;

    document.getElementById("memberForm").reset();

});

// Search members
document.getElementById("searchMember").addEventListener("input", function() {

    renderMembers(this.value);

});

// ======================================
// 8. BORROWING MANAGEMENT
// ======================================

function renderBorrowOptions() {

    const bookSelect = document.getElementById("borrowBook");

    const memberSelect = document.getElementById("borrowMember");

    bookSelect.innerHTML = `
        <option value="">Select Book</option>
        ${books.filter(book => book.available > 0).map(book => `
            <option value="${book.id}">
                ${escapeHTML(book.title)} (${book.available} available)
            </option>
        `).join("")}
    `;

    memberSelect.innerHTML = `
        <option value="">Select Member</option>
        ${members.map(member => `
            <option value="${member.id}">
                ${escapeHTML(member.name)}
            </option>
        `).join("")}
    `;

}

// Set default borrowing date
const today = new Date().toISOString().slice(0, 10);

document.getElementById("borrowDate").value = today;

document.getElementById("borrowDate").min = today;

document.getElementById("dueDate").min = today;

// Borrow book
document.getElementById("borrowForm").addEventListener("submit", function(e) {

    e.preventDefault();

    const bookId = Number(document.getElementById("borrowBook").value);

    const memberId = Number(document.getElementById("borrowMember").value);

    const borrowDate = document.getElementById("borrowDate").value;

    const dueDate = document.getElementById("dueDate").value;

    const book = getBook(bookId);

    const member = getMember(memberId);

    if (!book || !member || book.available < 1) {
        alert("Invalid book or member selection.");
        return;
    }

    if (dueDate <= borrowDate) {
        alert("Due date must be after the borrowing date.");
        return;
    }

    // Create borrowing record
    borrowings.push({

        id: Date.now(),

        bookId,

        memberId,

        borrowDate,

        dueDate,

        returnDate: null

    });

    // Reduce available copies
    book.available--;

    saveData();

    refreshAll();

    this.reset();

    document.getElementById("borrowDate").value = today;

    alert("Book borrowed successfully!");

});

// Display borrowing records
function renderBorrowings() {

    const table = document.getElementById("borrowingTable");

    table.innerHTML = borrowings.map(record => {

        const book = getBook(record.bookId);

        const member = getMember(record.memberId);

        const status = getBorrowStatus(record);

        return `

            <tr>

                <td>${escapeHTML(book?.title || "Deleted book")}</td>

                <td>${escapeHTML(member?.name || "Deleted member")}</td>

                <td>${record.borrowDate}</td>

                <td>${record.dueDate}</td>

                <td>
                    <span class="status ${status === "Overdue" ? "overdue" : status === "Returned" ? "returned" : ""}">
                        ${status}
                    </span>
                </td>

            </tr>

        `;

    }).join("");

}

// ======================================
// 9. RECENT BORROWINGS
// ======================================

function renderRecentBorrowings() {

    const table = document.getElementById("recentBorrowings");

    const recent = [...borrowings].reverse().slice(0, 5);

    table.innerHTML = recent.map(record => {

        const book = getBook(record.bookId);

        const member = getMember(record.memberId);

        const status = getBorrowStatus(record);

        return `

            <tr>

                <td>${escapeHTML(book?.title || "Deleted book")}</td>

                <td>${escapeHTML(member?.name || "Deleted member")}</td>

                <td>${record.borrowDate}</td>

                <td>${record.dueDate}</td>

                <td>
                    <span class="status ${status === "Overdue" ? "overdue" : status === "Returned" ? "returned" : ""}">
                        ${status}
                    </span>
                </td>

            </tr>

        `;

    }).join("");

}

// ======================================
// 10. RETURN MANAGEMENT
// ======================================

function renderReturns() {

    const table = document.getElementById("returnsTable");

    const activeBorrowings = borrowings.filter(record =>
        !record.returnDate
    );

    if (activeBorrowings.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="5">No borrowed books to return.</td>
            </tr>
        `;

        return;

    }

    table.innerHTML = activeBorrowings.map(record => {

        const book = getBook(record.bookId);

        const member = getMember(record.memberId);

        return `

            <tr>

                <td>${escapeHTML(book?.title || "Deleted book")}</td>

                <td>${escapeHTML(member?.name || "Deleted member")}</td>

                <td>${record.borrowDate}</td>

                <td>${record.dueDate}</td>

                <td>

                    <button class="primary-btn"
                        onclick="returnBook(${record.id})">
                        Return Book
                    </button>

                </td>

            </tr>

        `;

    }).join("");

}

// Return a book
function returnBook(id) {

    const record = borrowings.find(b => b.id === id);

    if (!record || record.returnDate) return;

    if (!confirm("Confirm that this book has been returned?")) {
        return;
    }

    record.returnDate = new Date().toISOString().slice(0, 10);

    const book = getBook(record.bookId);

    if (book) {
        book.available++;
    }

    saveData();

    refreshAll();

    alert("Book returned successfully!");

}

// ======================================
// 11. REPORT EXPORT
// ======================================

document.getElementById("exportBtn").addEventListener("click", () => {

    const rows = [
        ["Borrow ID", "Book", "Member", "Borrow Date", "Due Date", "Return Date", "Status"],

        ...borrowings.map(record => {

            const book = getBook(record.bookId);

            const member = getMember(record.memberId);

            return [
                record.id,
                book?.title || "Deleted book",
                member?.name || "Deleted member",
                record.borrowDate,
                record.dueDate,
                record.returnDate || "Not returned",
                getBorrowStatus(record)
            ];

        })

    ];

    // Convert data into CSV
    const csv = rows.map(row =>
        row.map(value =>
            '"' + String(value).replace(/"/g, '""') + '"'
        ).join(",")
    ).join("\n");

    // Download CSV file
    const blob = new Blob(["\uFEFF" + csv], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = "library-borrowing-report.csv";

    link.click();

    URL.revokeObjectURL(url);

});

// ======================================
// 12. DARK MODE
// ======================================

document.getElementById("themeBtn").addEventListener("click", () => {

    document.body.classList.toggle("dark");

    localStorage.setItem(
        "darkMode",
        document.body.classList.contains("dark")
    );

});

// Restore saved theme
if (localStorage.getItem("darkMode") === "true") {

    document.body.classList.add("dark");

}

// ======================================
// 13. DATE
// ======================================

document.getElementById("today").textContent =
    new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });

// ======================================
// 14. REFRESH ALL DATA
// ======================================

function refreshAll() {

    renderBooks();

    renderMembers();

    renderBorrowOptions();

    renderBorrowings();

    renderReturns();

    updateDashboard();

}

// ======================================
// 15. START APPLICATION
// ======================================

refreshAll();
