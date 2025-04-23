// Add listener for the form on the DOM is loaded.
document.addEventListener('DOMContentLoaded', ()=>{
    const searchForm = document.querySelector('form.search');

    // Async function used to search the result.
    searchForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        // Get the search text.
        const query = document.getElementById('search').value;
        console.log(query);
        const res = await fetch(`/search?keyword=${query}`);
        const result = await res.json();

        // Get the table body.
        const resultTableBody = document.querySelector("#searchResult tbody");
        resultTableBody.innerHTML = '';

        // Check if the result is empty.
        if(!res.ok){
            console.log("No result found.");
        }else if(result.data.length > 0){
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
        
    });
});