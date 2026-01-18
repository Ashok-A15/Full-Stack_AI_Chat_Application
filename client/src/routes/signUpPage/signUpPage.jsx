import './signUpPage.css';
import { SignUp } from '@clerk/clerk-react';   // 👈 Add this import

const SignUpPage = () => {
  return (
    <div className='signUpPage'>
      <SignUp 
        path='/sign-up' 
        routing='path'       // 👈 ensures React Router works
        signInUrl='/sign-in' // 👈 link to your sign-in page
      />
    </div>
  );
};

export default SignUpPage;
