import React, { useContext } from "react";
import Navbar, { AuthModalContext } from "../components/stick/Navbar";
import studentImg from "../assets/img.png";
import instructorImg from "../assets/Teacher.png";
import studentsGroupImg from "../assets/Student.png";

function Home() {
  // Access the context to get the openAuthModal function
  const openAuthModal = useContext(AuthModalContext);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800 text-white relative overflow-hidden">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-10 bg-repeat z-0"
        style={{
          backgroundImage: "url('/pattern-education.png')",
          backgroundSize: "300px",
        }}
      ></div>

      <Navbar />

      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-24 pb-16 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl font-bold mb-4 ">
              <span className="text-[#00FF40]">Studying</span> Online is now
              <br />
              much easier
            </h1>
            <p className="text-gray-300 mb-8 max-w-lg">
              Transform your learning experience with our intuitive platform
              designed for students and educators alike.
            </p>
            <button
              onClick={() => openAuthModal("signup", "student")}
              className="bg-[#00FF40] hover:bg-[#00DD30] text-black font-bold py-3 px-8 rounded-full transition duration-300 transform hover:-translate-y-1"
            >
              Join for free
            </button>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <img
              src={studentImg}
              alt="Student studying online"
              className="max-w-full md:max-w-md h-auto"
            />
          </div>
        </div>
      </div>

      {/* What is GyanSort Section */}
      <div className="container mx-auto px-4 py-16 text-center relative z-10">
        <h2 className="text-4xl font-bold mb-8">
          What is <span className="text-[#00FF40]">GyanSort</span>?
        </h2>
        <p className="max-w-3xl mx-auto text-gray-300 mb-16">
          GyanSort is a platform that allows educators to create online classes
          whereby they can store the course materials online; manage
          assignments, quizzes and exams; monitor due dates; grade results and
          provide students with feedback all in one place.
        </p>

        {/* For Instructors and Students Section */}
        <div className="grid md:grid-cols-2 gap-8 mt-8">
          {/* For Instructors */}
          <div className="bg-gray-800 bg-opacity-50 rounded-xl overflow-hidden shadow-xl">
            <div className="h-64 overflow-hidden">
              <img
                src={instructorImg}
                alt="Instructor"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-bold mb-6 text-center">
                FOR INSTRUCTORS
              </h3>
              <div className="flex justify-center">
                <button
                  onClick={() => openAuthModal("signup", "instructor")}
                  className="border-2 border-white hover:border-[#00FF40] hover:text-[#00FF40] font-medium py-2 px-6 rounded-full transition duration-300"
                >
                  Start a class today
                </button>
              </div>
            </div>
          </div>

          {/* For Students */}
          <div className="bg-gray-800 bg-opacity-50 rounded-xl overflow-hidden shadow-xl">
            <div className="h-64 overflow-hidden">
              <img
                src={studentsGroupImg}
                alt="Students"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-bold mb-6 text-center">
                FOR STUDENTS
              </h3>
              <div className="flex justify-center">
                <button
                  onClick={() => openAuthModal("signup", "student")}
                  className="bg-[#00FF40] hover:bg-[#00DD30] text-black font-medium py-2 px-6 rounded-full transition duration-300"
                >
                  Join a class today
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 py-8 mt-16 relative z-10">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>© 2023 GyanSort. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
