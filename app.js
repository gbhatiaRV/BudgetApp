// BUDGET CONTROLLER - Component to calculate Budget, Income and Expense Totals
var budgetController = (function(){
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };
    
    
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };
    
    
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    
    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
           // console.log(cur.value);
            sum = sum + Math.round(cur.value);
        });
        data.totals[type] = sum;
        //console.log(sum);
    };
    
    
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };
    return {
        addItem: function(type, des, val) {
            var newItem, ID;
            
            
            // Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            
            //creating item according to type Exp/Inc
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            
            // allItems holds exp and inc arrays - it adds new item to respective type
            data.allItems[type].push(newItem);
            
            // Return the new created element either income or expense
            return newItem;
        },
        
        
        deleteItem: function(type, id) {
            var ids, index;
            
            
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);   // it finds the position of current id in all ids

            //console.log(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
            //console.log(data.allItems[type]);
        },
        
        
        calculateBudget: function() {
            
            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            
            // Calculate the budget: income - expenses data is a variable that holds budget, percentage, totals and allitems
            data.budget = data.totals.inc - data.totals.exp;
            
            // calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }            
            
            
        },
        
        calculatePercentages: function() {
            
            data.allItems.exp.forEach(function(cur) {
               cur.calcPercentage(data.totals.inc);
            });
        },
        
        
        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },
        
        
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },
        
       
    };

})();

//UI Controller
var UIcontroller = (function(){

    var DOMstrings = {
        inputType: '.add__type',
        inputDesc: '.add__description',
        inputVal: '.add__value',
        inputBtn: '.add__btn',
        incomeDiv: '.income__list',
        expenseDiv: '.expenses__list',
        incomeTotal: '.budget__income--value',
        budgetVal: '.budget__value',
        expenseTotal: '.budget__expenses--value',
        inputBtn: '.add__btn',
        percentageVal: '.budget__expenses--percentage',
        container: '.container',
        expensesPercVal: '.item__percentage',
        dateVal: '.budget__title--month'


    };

    var formatNumber = function(num, type) {
        var numSplit, int, dec, type;
       //just to put , in num to show in UI

        num = Math.abs(num);
        num = num.toFixed(2); // to get 2 decimal places

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); //input 23510, output 23,510
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    };

    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

//Reading data from UI
return {
getInput: function(){
    //var obj = document.querySelector('.add__type').value;
var obj = 
    {
        type: document.querySelector(DOMstrings.inputType).value,
        desc: document.querySelector(DOMstrings.inputDesc).value,
       val: document.querySelector(DOMstrings.inputVal).value
    };
    
    //console.log(obj);
    return obj;
},

addListItem: function(obj, type) {
    var html, newHtml, element;
    // Create HTML string with placeholder text
    
    if (type === 'inc') {
        element = DOMstrings.incomeDiv;
        
        html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
    } else if (type === 'exp') {
        element = DOMstrings.expenseDiv;
        
        html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
    }
    
    // Replace the placeholder text with some actual data
    //console.log('objID  '+type+'-'+obj.id);
    newHtml = html.replace('%id%',obj.id);
    newHtml = newHtml.replace('%description%', obj.description);
    newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
    
    // Insert the HTML into incomeDiv or expenseDiv
    document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
},


deleteListItem: function(selectorID) {
    
    var el = document.getElementById(selectorID);
    el.parentNode.removeChild(el);
    
},


clearFields: function() {

    // to clear fields while initiating
    var fields, fieldsArr;
    
    fields = document.querySelectorAll(DOMstrings.inputDesc + ', ' + DOMstrings.inputVal);
    
    fieldsArr = Array.prototype.slice.call(fields);
    
    fieldsArr.forEach(function(current, index, array) {
        current.value = "";
    });
    
    fieldsArr[0].focus(); // get focus on first element
},


displayBudget: function(obj) {   // displaying budget 
    var type;
    obj.budget > 0 ? type = 'inc' : type = 'exp';
    
    document.querySelector(DOMstrings.budgetVal).textContent = formatNumber(obj.budget, type);
    document.querySelector(DOMstrings.incomeTotal).textContent = formatNumber(obj.totalInc, 'inc');
    document.querySelector(DOMstrings.expenseTotal).textContent = formatNumber(obj.totalExp, 'exp');
    
    if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageVal).textContent = obj.percentage + '%';
    } else {
        document.querySelector(DOMstrings.percentageVal).textContent = '---';
    }
    
},


displayPercentages: function(percentages) {
    
    var fields = document.querySelectorAll(DOMstrings.expensesPercVal);
    
    nodeListForEach(fields, function(current, index) {
        
        if (percentages[index] > 0) {
            current.textContent = percentages[index] + '%';
        } else {
            current.textContent = '---';
        }
    });
    
},

// Function to display current month and year
displayMonth: function() {
    var todayDT, Allmnths, month, year;
    
    todayDT = new Date();
    
    Allmnths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    month = todayDT.getMonth();
    
    year = todayDT.getFullYear();
    document.querySelector(DOMstrings.dateVal).textContent = Allmnths[month] + ' ' + year;
},


changedType: function() {
    
    var fields = document.querySelectorAll(
        DOMstrings.inputType + ',' +
        DOMstrings.inputDescription + ',' +
        DOMstrings.inputValue);
    
    nodeListForEach(fields, function(cur) {
       cur.classList.toggle('red-focus'); 
    });
    
    document.querySelector(DOMstrings.inputBtn).classList.toggle('red'); // just to change the class to red
    
},


getDOMstrings: function() {
    return DOMstrings;
}, // function to get DOMStrings value so that we can use it in other modules as well

updateIncomeExp: function(type,desc,val){
    var divUpdate;
if(type=='inc')
{
divUpdate = '<div class="item__description">'+desc+'</div><div class="right clearfix"><div class="item__value">+ '+val+'</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div>'
}
else
{
divUpdate = '<div class="item__description">'+desc+'</div><div class="right clearfix"><div class="item__value">- '+val+'</div><div class="item__percentage">10%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div>'
}
return divUpdate;
},
/*

getDomObj: function(DOMStr){
    console.log(DOMStrings.DOMStr);
    return DOMStrings.DOMStr;
}
*/
};
})();


//Global App Controller
var appController = (function(budgetCtrl,UICtrl){

    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMstrings();
        
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
        
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem); // to delete income AND expenses
        
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);    //     change buttons in income and expense list ie green or red
    };


    var updateBudget = function() {
        
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();
        
        // 2. Return the budget from budgetcontroller and pass it into UI controller
        var budget = budgetCtrl.getBudget();
        
        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    };
    
    
    var updatePercentages = function() {
        
        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();
        
        // 2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();
        
        // 3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
    };
    
    var ctrlAddItem = function() {
        var input, newItem;

        //alert('hello');
        
        // 1. Get the field input data
        input = UICtrl.getInput();        
        
       if (input.desc !== "" && !isNaN(input.val) && input.val > 0) {
            //console.log(input);
            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.desc, input.val);

            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the fields
            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();
            
            // 6. Calculate and update percentages
            updatePercentages();
        }
    };
    

   /* var cntrlAdditem = function(){

         //code for getting UI Data
         var input = uiCntrl.getInput();
         console.log(input.type);
         var divHTML = uiCntrl.updateIncomeExp(input.type,input.desc,input.val);
         var classNm = (input.type=='inc')?'.income__list' : '.expenses__list';
         var newdiv = document.createElement('div');
         newdiv.innerHTML = divHTML;
         newdiv.className = 'item clearfix';
         newdiv.id = (input.type=='inc')?'income-0' : 'expense-0';


         
         document.querySelector(classNm).appendChild(newdiv);

    };*/
    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        console.log('check');
        console.log(event.target.parentNode.parentNode.parentNode.parentNode);
        
        if (itemID) {
            
            //inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            // 1. delete the item from the data structure
            console.log(itemID+"     "+ID);
            budgetCtrl.deleteItem(type, ID);
            
            // 2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);
            
            // 3. Update and show the new budget
            updateBudget();
            
            // 4. Calculate and update percentages
            updatePercentages();
        }
    };
    
    
    return {
        init: function() {
            console.log('Application has started.');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };


    

//document.querySelector('.add__btn').addEventListener('click',cntrlAdditem);

// We also can add income and expenses with press of return key
// we will add keypress event as well

/*document.addEventListener('keypress',function(event){

    if(event.keyCode == 13 || event.which == 13)
{
   cntrlAdditem();
}
});*/

})(budgetController,UIcontroller);

appController.init();