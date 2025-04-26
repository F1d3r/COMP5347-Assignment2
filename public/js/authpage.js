

// Regular expression for verifying the password input.
const pwdRegex = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}/;

// Setup the elements in the page after the document is loaed.
document.addEventListener('DOMContentLoaded', ()=>{
    const loginEmailInput = document.getElementById('loginEmail');
    const loginPwdInput = document.getElementById('loginPwd');
    const signupEmailInput = document.getElementById('signupEmail');
    const firstnameInput = document.getElementById('signupFN');
    const lastnameInput = document.getElementById('signupLN');
    const signupPwdInput = document.getElementById('signupPwd');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    //Add listener for the password input.
    loginPwdInput.addEventListener('input', ()=>{
        console.log("Input a character");
        // If the input value is not matching the rquirement,
        // Turn the frame color to red.
        if(pwdRegex.test(loginPwdInput.value)){
            loginPwdInput.classList.remove('invalid');
        }else{
            loginPwdInput.classList.add('invalid');
        }
    })

    // Add listener for the password input.
    signupPwdInput.addEventListener('input', ()=>{
        console.log("Input a character");
        // If the input value is not matching the rquirement,
        // Turn the frame color to red.
        if(pwdRegex.test(loginPwdInput.value)){
            signupPwdInput.classList.remove('invalid');
        }else{
            signupPwdInput.classList.add('invalid');
        }
    })

    // // Encrypt the password before sending request to the server.
    // loginForm.addEventListener('submit', async ()=>{
    //     console.log("Login clicked");
    //     event.preventDefault();
    //     const username = loginEmailInput.value;
    //     const pwd = loginPwdInput.value;

    //     // Hash the password plaintext to encrypt it. 
    //     const saltRound = 10;
    //     const salt = await bcrypt.genSalt(saltRound);
    //     const pwdHash = await bcrypt.hash(pwd, salt);
    //     console.log(pwdHash);

    //     // Then send the login request and wait for the response. 
    //     const res = fetch('/login', {
    //         method: 'POST',
    //         username: username,
    //         pwd: pwdHash
    //     }).catch(error =>
    //         console.log("Submit error.", error)
    //     );

    //     // Handle respose. In case it is not OK.
    //     if(!res.ok){
    //         console.log("Login response not OK");
    //         loginForm.reset();
    //     }
            
    // })

})



