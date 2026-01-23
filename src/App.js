 
import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from './Components/Layout';
import Login from './Pages/Login';
import Dashboard from './Pages/Dashboard';
import Signup from './Pages/Signup';
import Newlead from './Pages/New-lead';
import Leadlist from './Pages/Leadlist';
 
import AddStudent from "./Pages/Student/AddStudent";
import StudentList from "./Pages/Student/StudentList";
import "@fortawesome/fontawesome-free/css/all.min.css";


function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
           <Route path="/dashboard" element={<Layout><Dashboard/></Layout>} />
           <Route path="/New-lead" element={<Layout><Newlead/></Layout>} />
             <Route path="/Leadlist" element={<Layout><Leadlist/></Layout>} />
         
             {/* <Route path="/student/AddStudent" element={<Layout><AddStudent/></Layout>} /> */}
             <Route path="/Student/AddStudent" element={<Layout><AddStudent/></Layout >} />
              <Route path="/Student/AddStudent/:studentId" element={<Layout><AddStudent /></Layout>} />
             <Route path="/student/StudentList" element={<Layout><StudentList/></Layout>} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
