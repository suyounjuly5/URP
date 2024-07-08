import React from 'react';
import useToken from './Component/useToken.js';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';




import { LoginPage } from './Pages/LoginPage';
import { MainPage } from './Pages/MainPage';


import './App.css';


function App() {

  const { token, removeToken, setToken } = useToken();

  return (
    <Router>
      <div className='App'>
        {!token && token!=="" &&token!== undefined?
          <LoginPage setToken={setToken}/>
          :
          <>
            <Routes>
              <Route path='/' element={<MainPage token={token} setToken={setToken} removeToken={removeToken}/>} />
            </Routes>
          </>
        }
      </div>
    </Router>
  );
}



// function App() {
//   return (
//     <Router>
//       <div className="App">
//         <Routes>
//           <Route path = '/' element = {<LoginPage/>} />
//           <Route path = '/main' element = {<MainPage/>}/>
//         </Routes>
//       </div>
//     </Router>
    
//   );
// }

export default App;
