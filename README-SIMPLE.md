# ✨ Simple Expense Tracker

**Bilkul simple project - HTML, CSS, aur JavaScript mein**

## 🎯 Kya Hai Is Project Mein?

Yeh ek **expense tracker** hai jismein aap apne din ke kharch ka hisaab rakh sakte hain.

### Features:
- ✅ Expense add kar sakte hain (amount, category, date)
- ✅ Sare expenses ki list dekh sakte hain
- ✅ Expense delete kar sakte hain
- ✅ Summary dekh sakte hain (total, average, category-wise)
- ✅ Mobile-friendly responsive design
- ✅ LocalStorage support (agar backend na ho to bhi kaam karega)

## 📁 Project Structure

```
├── frontend/public/          # Frontend files
│   ├── index.html           # Main HTML file
│   ├── style.css            # Styling
│   └── app.js               # JavaScript logic
│
└── backend-simple/          # Backend files
    ├── server.js            # Simple Node.js server
    └── package.json         # Package info
```

## 🚀 Kaise Chalayein?

### Step 1: Backend Start Karein

```bash
# Backend folder mein jayein
cd backend-simple

# Server start karein
node server.js
```

Server yahan chalega: `http://localhost:3000`

### Step 2: Frontend Open Karein

```bash
# Frontend folder mein jayein
cd frontend/public

# Koi bhi simple HTTP server chalayein, ya seedha browser mein open karein
# Option 1: Live Server (VS Code extension)
# Option 2: Python HTTP server
python3 -m http.server 8080

# Ya seedha file browser mein open karein
# Right click on index.html → Open with Browser
```

Frontend yahan khulega: `http://localhost:8080`

## 📝 Kaise Use Karein?

1. **Expense Add Karein:**
   - "Add Expense" tab par click karein
   - Amount, category, date fill karein
   - "Add Expense" button dabayein

2. **Expenses Dekhein:**
   - "Expenses List" tab par jayein
   - Sare expenses table mein dikhenge
   - Edit ya Delete kar sakte hain

3. **Summary Dekhein:**
   - "Summary" tab par click karein
   - Total spent, average, category-wise breakdown dekhein

## 🛠️ Technology Stack

**Frontend:**
- HTML5 - Structure ke liye
- CSS3 - Styling ke liye
- JavaScript (Vanilla) - Logic ke liye

**Backend:**
- Node.js - Simple HTTP server
- Koi framework nahi (No Express, No React)
- Bilkul plain JavaScript

## 💡 Important Points

1. **Backend Optional Hai:**
   - Agar backend nahi chala to bhi frontend kaam karega
   - LocalStorage use hoga data save karne ke liye

2. **Simple Code:**
   - Sari code samajhne mein aasan hai
   - Koi complex framework nahi
   - Beginners ke liye perfect

3. **Responsive Design:**
   - Mobile, tablet, desktop sabmein kaam karega
   - Modern UI with gradients

## 🔧 Troubleshooting

**Backend start nahi ho raha?**
```bash
# Node.js installed hai check karein
node --version

# Agar nahi hai to install karein
# Download from: https://nodejs.org
```

**CORS error aa raha hai?**
- Backend mein CORS already allow hai
- Browser cache clear karein

**Data save nahi ho raha?**
- Backend running hai check karein
- LocalStorage mein automatically save hoga agar backend nahi hai

## 📚 Files Explanation

**index.html** - Main structure
- Form for adding expenses
- Table for listing expenses  
- Summary section

**style.css** - Styling
- Modern gradient design
- Responsive layout
- Professional look

**app.js** - JavaScript logic
- API calls to backend
- DOM manipulation
- LocalStorage fallback

**server.js** - Simple backend
- HTTP server without framework
- In-memory storage
- CORS enabled

## 🎓 Learning Tips

Yeh project perfect hai agar aap seekh rahe hain:
- ✓ HTML structure
- ✓ CSS styling & responsive design
- ✓ JavaScript DOM manipulation
- ✓ API calls (fetch)
- ✓ LocalStorage
- ✓ Node.js basics

## 📞 Help Chahiye?

1. Code mein comments hai - padh kar samjhein
2. Console mein errors check karein
3. Backend logs dekhein

---

**Made with ❤️ using Simple HTML, CSS & JavaScript**

Bilkul simple, bilkul easy! 🚀
