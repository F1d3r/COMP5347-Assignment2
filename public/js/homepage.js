const loggedIn = fetch('/isLoggedIn', {
    method: 'GET'
})
  .then(response => response.json())
  .then(response => {
    console.log(response);
    console.log(response.user.role);
    if (response.user.role == 'user') {
      console.log('Has already logged in.');
      return true;
    } else {
      console.log('Access as guest.');
      return false;
    }
  });

setSearchForm = function(){
    const searchForm = document.querySelector('form.search');
    // Async function used to search the result.
    searchForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        // Get the search text.
        const keyword = document.getElementById('searchInput').value;
        const brand = document.getElementById('brandSelect').value;
        console.log(keyword);

        try{
            const res = await fetch(`/search?keyword=${keyword}&brand=${brand}`);
            // Check if the result is empty.
            if(!res.ok){
                throw new Error("Bad request, no response.");
            }
            
            // If the response is ok, then resolve the json.
            const result = await res.json();
    
            // Get the table body.
            const resultTableBody = document.querySelector("#searchResult tbody");
            resultTableBody.innerHTML = '';
    
            if(result.count > 0){
                console.log(result);
                // Then add each phone of the result into the table.
                result.data.forEach(phone => {
                    const row = document.createElement('tr');
                    const titleCell = document.createElement('td');
                    const brandCell = document.createElement('td');
                    const imageCell = document.createElement('td');
                    const stockCell = document.createElement('td');
                    const sellerCell = document.createElement('td');
                    const priceCell = document.createElement('td');
                    const reviewsCell = document.createElement('td');
    
                    // Fill and Add cells into the row.
                    titleCell.textContent = phone.title;
                    row.appendChild(titleCell);
                    brandCell.textContent = phone.brand;
                    row.appendChild(brandCell);
                    imageCell.textContent = phone.image;
                    row.appendChild(imageCell);
                    stockCell.textContent = phone.stock;
                    row.appendChild(stockCell);
                    sellerCell.textContent = phone.seller;
                    row.appendChild(sellerCell);
                    priceCell.textContent = phone.price;
                    row.appendChild(priceCell);
                    reviewsCell.textContent = phone.reviews;
                    row.appendChild(reviewsCell);
                    // Add row into table.
                    resultTableBody.appendChild(row);
                });
            }else{
                console.log("No result found.");
            }
        }catch(error){
            console.error('Error fetching search result:', error);
        }
        
        
    });
}

setBrandSelection = async function(){
    const brandSelection = document.querySelector('#brandSelect');
    // Empty all option.
    brandSelection.innerHTML = '';
    // Add a default All option.
    const defaultOpt = document.createElement("option");
    defaultOpt.innerHTML = 'All';
    defaultOpt.value = 'All';
    brandSelection.appendChild(defaultOpt);

    try{
        // Ask server for all brand list.
        const res = await fetch(`/allBrand`);
            
        // Check the response.
        if(!res.ok){
            throw new Error("Bad request, no response.");
        }

        // If the response is ok, resolve the json.
        const result = await res.json();

        if(result.count > 0){
            console.log(result);
            // Then add each brand result into the dropdown menu.
            result.data.forEach(brand => {
                const opt = document.createElement("option");
                opt.innerHTML = brand;
                opt.value = brand;
                brandSelection.appendChild(opt);
            })
        }else{
            console.log("No result found.");
        }

    }catch(error){
        console.error('Error fetching search result:', error);
    }
    
}

// Setup the price slider, 
// set its maximum and minimum range fetched form the server.
// Bond the two sliders, make them work together.
// Bond the labels and the slider, 
// make them dynamically show the result of the slider
setupPriceSlider = async function(){

}

// Setup the profile, signin and checkout buttons.
setupProfileBtn = function(){

}

// Send request to the server on click this button.
setupSigninBtn = function(){
    const signInBtn = document.getElementById('signinBtn');

    signInBtn.addEventListener('click', ()=>{
        console.log("Login Button Clicked.");
        window.location.href = '/auth';
    })
}


setupProfileBtn = function(){
    const profileBtn = document.getElementById('profileBtn');

    profileBtn.addEventListener('click', ()=>{
        console.log("Profile Button Clicked.");
        if(loggedIn){
            window.location.href = '/profile';
        }
    })
}


// Set up the page elements after the DOM content is loaded.
document.addEventListener('DOMContentLoaded', ()=>{
    // Setup the dropdown menu of brand selection.
    setBrandSelection();

    // Add listener for the searchform on the DOM is loaded.
    setSearchForm();

    setupSigninBtn();

    setupProfileBtn();

    
});

