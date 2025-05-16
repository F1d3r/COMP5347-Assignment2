
document.addEventListener('DOMContentLoaded', ()=>{
    const editBtn = document.getElementById('editBtn');
    const userDetail = document.querySelectorAll('input.userDetail');

    // Set all input as editable when clicking the edit button.
    editBtn.addEventListener('click', ()=>{
        userDetail.forEach(input => {
            input.readOnly = false;
        })
    })

})