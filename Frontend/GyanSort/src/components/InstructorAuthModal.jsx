import React from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import StudentLoginForm from "./auth/StudentLoginForm";
import StudentSignupForm from "./auth/StudentSignupForm";
import InstructorLoginForm from "./auth/InstructorLoginForm";
import InstructorSignupForm from "./auth/InstructorSignupForm";

const AuthModal = ({ isOpen, onClose, type, userType }) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 flex justify-between items-center"
                >
                  <span>
                    {type === "login" ? "Login" : "Sign Up"}
                    {type === "signup" &&
                      ` as ${
                        userType === "instructor" ? "Instructor" : "Student"
                      }`}
                  </span>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </Dialog.Title>
                <div className="mt-4">
                  {type === "login" && userType === "student" && (
                    <StudentLoginForm onClose={onClose} />
                  )}
                  {type === "signup" && userType === "student" && (
                    <StudentSignupForm onClose={onClose} />
                  )}
                  {type === "login" && userType === "instructor" && (
                    <InstructorLoginForm onClose={onClose} />
                  )}
                  {type === "signup" && userType === "instructor" && (
                    <InstructorSignupForm onClose={onClose} />
                  )}
                </div>
                <div className="mt-4 text-center text-sm text-gray-500">
                  {type === "login" ? (
                    <p>
                      Don't have an account?{" "}
                      <button
                        type="button"
                        className="text-[#00FF40] hover:underline"
                        onClick={() => {
                          onClose();
                          setTimeout(() => {
                            document
                              .querySelector(`[data-auth="signup-${userType}"]`)
                              ?.click();
                          }, 100);
                        }}
                      >
                        Sign up
                      </button>
                    </p>
                  ) : (
                    <p>
                      Already have an account?{" "}
                      <button
                        type="button"
                        className="text-[#00FF40] hover:underline"
                        onClick={() => {
                          onClose();
                          setTimeout(() => {
                            document
                              .querySelector(`[data-auth="login-${userType}"]`)
                              ?.click();
                          }, 100);
                        }}
                      >
                        Login
                      </button>
                    </p>
                  )}
                  {userType === "student" ? (
                    <p className="mt-2">
                      Are you an instructor?{" "}
                      <button
                        type="button"
                        className="text-[#00FF40] hover:underline"
                        onClick={() => {
                          onClose();
                          setTimeout(() => {
                            document
                              .querySelector(`[data-auth="${type}-instructor"]`)
                              ?.click();
                          }, 100);
                        }}
                      >
                        {type === "login" ? "Login" : "Sign up"} as instructor
                      </button>
                    </p>
                  ) : (
                    <p className="mt-2">
                      Are you a student?{" "}
                      <button
                        type="button"
                        className="text-[#00FF40] hover:underline"
                        onClick={() => {
                          onClose();
                          setTimeout(() => {
                            document
                              .querySelector(`[data-auth="${type}-student"]`)
                              ?.click();
                          }, 100);
                        }}
                      >
                        {type === "login" ? "Login" : "Sign up"} as student
                      </button>
                    </p>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default AuthModal;
