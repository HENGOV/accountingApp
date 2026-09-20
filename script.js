let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

const typeEl = document.getElementById("type");
const amountEl = document.getElementById("amount");
const categoryEl = document.getElementById("category");
const noteEl = document.getElementById("note");
const addBtn = document.getElementById("addBtn");
const transactionList = document.getElementById("transactionList");

const totalIncomeEl = document.getElementById("totalIncome");
const totalExpenseEl = document.getElementById("totalExpense");
const balanceEl = document.getElementById("balance");

function saveTransactions() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

function renderTransactions() {
  transactionList.innerHTML = "";

  let income = 0;
  let expense = 0;

  transactions.forEach((item, index) => {
    if (item.type === "income") {
      income += item.amount;
    } else {
      expense += item.amount;
    }

    const div = document.createElement("div");
    div.className = "transaction";

    div.innerHTML = `
      <div>
        <strong>${item.category}</strong>
        <div>${item.note || "无备注"}</div>
        <small>${item.date}</small>
      </div>

      <div>
        <strong class="${item.type}">
          ${item.type === "income" ? "+" : "-"}$${item.amount.toFixed(2)}
        </strong>
        <button class="delete-btn" onclick="deleteTransaction(${index})">
          删除
        </button>
      </div>
    `;

    transactionList.appendChild(div);
  });

  totalIncomeEl.textContent = "$" + income.toFixed(2);
  totalExpenseEl.textContent = "$" + expense.toFixed(2);
  balanceEl.textContent = "$" + (income - expense).toFixed(2);
}

function addTransaction() {
  const amount = parseFloat(amountEl.value);

  if (!amount || amount <= 0) {
    alert("请输入正确的金额");
    return;
  }

  const transaction = {
    type: typeEl.value,
    amount: amount,
    category: categoryEl.value,
    note: noteEl.value.trim(),
    date: new Date().toLocaleString()
  };

  transactions.unshift(transaction);

  saveTransactions();
  renderTransactions();

  amountEl.value = "";
  noteEl.value = "";
}

function deleteTransaction(index) {
  transactions.splice(index, 1);
  saveTransactions();
  renderTransactions();
}

addBtn.addEventListener("click", addTransaction);

renderTransactions();