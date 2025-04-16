import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styled from "styled-components";

const Component = styled.div`
  /* General Styles */
  body {
    margin: 0;
    padding: 0;
    font-family: Arial, sans-serif;
    background-color: #ffffff;
  }

  .container {
    display: flex;
    /* align-items: center; */
    justify-content: center;
    min-height: 100vh;
    padding: 20px;
  }

  /* Left Side - Images */
  .image-container {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    max-width: 500px;
  }

  .image-container img {
    width: 100%;
    max-width: 350px;
    height: auto;
    border-radius: 10px;
  }

  /* First Image - Spinning Effect */
  .image-container .spinning-image {
    animation: spin 5s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  /* Second Image - Positioned on Top */
  .image-container .top-image {
    position: absolute;
    top: 30%;
    left: 80%;
    transform: translate(-50%, -50%);
    width: 60%;
    max-width: 250px;
    border-radius: 10px;
  }

  /* Right Side - Contact Form */
  .form-container {
    flex: 1;
    max-width: 500px;
    background: white;
    padding: 30px;
    border-radius: 8px;
  }

  .form-container h1 {
    text-align: center;
    margin-bottom: 20px;
  }

  .form-container input,
  .form-container textarea {
    width: 100%;
    padding: 10px;
    margin: 5px 0;
    border: 2px solid #ccc;
    border-radius: 5px;
    font-size: 16px;
  }

  .form-container button {
    width: 100%;
    padding: 12px;
    background-color: #4f46e5;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 18px;
    cursor: pointer;
    margin-top: 10px;
  }

  .form-container button:hover {
    background-color: #4338ca;
  }

  /* Responsive Design */
  @media (max-width: 900px) {
    .container {
      flex-direction: column-reverse;
      text-align: center;
    }

    .image-container {
      margin-bottom: 20px;
    }

    .image-container .top-image {
      width: 50%;
    }
  }
  .faq-header {
    font-size: 42px;
    border-bottom: 1px dotted #ccc;
    padding: 24px;
  }

  .faq-content {
    margin: 0 auto;
  }

  .faq-question {
    padding: 20px 0;
    border-bottom: 1px dotted #ccc;
  }

  .panel-title {
    font-size: 24px;
    width: 100%;
    position: relative;
    margin: 0;
    padding: 10px 10px 0 48px;
    display: block;
    cursor: pointer;
  }

  .panel-content {
    font-size: 20px;
    padding: 0px 14px;
    margin: 0 40px;
    height: 0;
    overflow: hidden;
    z-index: -1;
    position: relative;
    opacity: 0;
    -webkit-transition: 0.4s ease;
    -moz-transition: 0.4s ease;
    -o-transition: 0.4s ease;
    transition: 0.4s ease;
  }

  .panel:checked ~ .panel-content {
    height: auto;
    opacity: 1;
    padding: 14px;
  }

  .plus {
    position: absolute;
    margin-left: 20px;
    margin-top: 4px;
    z-index: 5;
    font-size: 42px;
    line-height: 100%;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    user-select: none;
    -webkit-transition: 0.2s ease;
    -moz-transition: 0.2s ease;
    -o-transition: 0.2s ease;
    transition: 0.2s ease;
  }

  .panel:checked ~ .plus {
    -webkit-transform: rotate(45deg);
    -moz-transform: rotate(45deg);
    -o-transform: rotate(45deg);
    transform: rotate(45deg);
  }

  .panel {
    display: none;
  }
`;

// import "./styles/enquiry.module.css";

const ErrorMessage = styled.span`
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
`;

const SuccessPopup = styled(motion.div)`
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: #22c55e;
  color: white;
  padding: 1rem;
  border-radius: 0.5rem;
  z-index: 50;
`;

const InputWrapper = styled.div`
  position: relative;

  .valid-icon {
    color: #22c55e;
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
  }

  .invalid-icon {
    color: #ef4444;
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
  }
`;

const CharacterCounter = styled.div`
  text-align: right;
  font-size: 0.75rem;
  color: ${(props) => (props.isExceeded ? "#ef4444" : "#6b7280")};
  margin-top: 0.25rem;
`;

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validate field on change for immediate feedback
    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const validateField = (name, value) => {
    switch (name) {
      case "name":
        if (!value.trim()) return "Name is required";
        if (value.length < 3) return "Name must be at least 3 characters";
        if (value.length > 35) return "Name must be less than 35 characters";
        return "";
      case "email":
        const emailRegex =
          /^[a-zA-Z0-9._%+-]+@(gmail|yahoo|hotmail|outlook|live|aol)\.(com|net|org|edu)$/i;
        if (!value) return "Email is required";
        if (!emailRegex.test(value))
          return "Please enter a valid email address";
        if (value.length > 45) return "Email must be less than 45 characters";
        return "";
      case "subject":
        if (value.trim() && value.length > 25)
          return "Subject must be less than 25 characters";
        return "";
      case "message":
        if (!value) return "Message is required";
        if (value.length < 5) return "Message must be at least 5 characters";
        if (value.length > 80) return "Message must be less than 80 characters";
        return "";
      default:
        return "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields before submission
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    setErrors(newErrors);

    // If there are any errors, don't submit
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          access_key: "c01b6a2b-25f4-4660-8fe6-d6ba80cf2de0",
          ...formData,
        }),
      });

      if (response.ok) {
        setShowSuccess(true);
        setFormData({ name: "", email: "", subject: "", message: "" });
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Component>
      {/* Add this right after the Component opening tag */}
      <AnimatePresence>
        {showSuccess && (
          <SuccessPopup
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
          >
            <div className="flex items-center">
              <i className="fas fa-check-circle mr-2"></i>
              Message sent successfully!
            </div>
          </SuccessPopup>
        )}
      </AnimatePresence>

      <div id="enquiry-form " className="w-screen">
        <div className="font-[sans-serif] p-4">
          <div className="max-w-6xl mx-auto relative bg-white  rounded-3xl overflow-hidden">
            {/* <div className="max-w-6xl mx-auto relative bg-white shadow-[0_2px_10px_-3px_rgba(186,186,186,0.7)] rounded-3xl overflow-hidden"> */}
            <div className="md:grid-cols-2 gap-6 py-8 px-6">
              <form
                className="rounded-tl-3xl rounded-bl-3xl max-md:-order-1"
                action={"https://api.web3forms.com/submit"}
                method="POST"
                id="form"
              >
                <h2 className="text-3xl  font-bold text-center mb-6">
                  Contact us
                </h2>
                <div className="max-w-[36rem] mx-auto space-y-3 relative">
                  <div className="flex justify-between max-sm:block">
                    <div className="sm:flex-col sm:w-[48%]">
                      <h2 className="pl-1">Full Name</h2>
                      <InputWrapper>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="Your name"
                          className={`w-full bg-gray-200 rounded-md py-3 px-4 pr-10 text-sm outline-none border ${
                            errors.name
                              ? "border-red-500"
                              : formData.name
                              ? "border-green-500"
                              : "border-gray-400"
                          } focus:border-[#e20878] focus:bg-transparent transition-all`}
                          aria-invalid={errors.name ? "true" : "false"}
                          aria-describedby="name-error"
                        />
                        {formData.name && !errors.name && (
                          <i className="fas fa-check-circle valid-icon" />
                        )}
                        {errors.name && (
                          <i className="fas fa-exclamation-circle invalid-icon" />
                        )}
                        {errors.name && (
                          <ErrorMessage id="name-error" role="alert">
                            {errors.name}
                          </ErrorMessage>
                        )}
                      </InputWrapper>
                    </div>
                    <div className="sm:flex-col sm:w-[48%] max-sm:mt-3">
                      <h2 className="pl-1">Email</h2>
                      <InputWrapper>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          placeholder="example@gmail.com"
                          className={`w-full bg-gray-200 rounded-md py-3 px-4 pr-10 text-sm outline-none border ${
                            errors.email
                              ? "border-red-500"
                              : formData.email
                              ? "border-green-500"
                              : "border-gray-400"
                          } focus:border-[#e20878] focus:bg-transparent transition-all`}
                          aria-invalid={errors.email ? "true" : "false"}
                          aria-describedby="email-error"
                        />
                        {formData.email && !errors.email && (
                          <i className="fas fa-check-circle valid-icon" />
                        )}
                        {errors.email && (
                          <i className="fas fa-exclamation-circle invalid-icon" />
                        )}
                        {errors.email && (
                          <ErrorMessage id="email-error" role="alert">
                            {errors.email}
                          </ErrorMessage>
                        )}
                      </InputWrapper>
                    </div>
                  </div>

                  <div className="mydict">
                    <h2 className="pl-1">Subject</h2>

                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Subject for the message"
                      className="w-full bg-gray-200 rounded-md py-3 px-4 text-sm outline-none border border-gray-400 focus:border-blue-600 focus:bg-transparent transition-all"
                    />
                  </div>

                  <div>
                    <h2 className="pl-1">Message</h2>
                    <InputWrapper>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Type your message here ..."
                        rows="6"
                        className={`w-full resize-none bg-gray-200 rounded-md px-4 text-sm pt-3 outline-none border ${
                          errors.message
                            ? "border-red-500"
                            : formData.message
                            ? "border-green-500"
                            : "border-gray-400"
                        } focus:border-[#e20878] focus:bg-transparent transition-all`}
                        aria-invalid={errors.message ? "true" : "false"}
                        aria-describedby="message-error"
                      ></textarea>
                      {formData.message && !errors.message && (
                        <i className="fas fa-check-circle valid-icon" />
                      )}
                      {errors.message && (
                        <i className="fas fa-exclamation-circle invalid-icon" />
                      )}
                      {errors.message && (
                        <ErrorMessage id="message-error" role="alert">
                          {errors.message}
                        </ErrorMessage>
                      )}
                      <CharacterCounter
                        isExceeded={formData.message.length > 80}
                      >
                        {formData.message.length}/80 characters
                      </CharacterCounter>
                    </InputWrapper>
                  </div>

                  <button
                    type="submit"
                    // disabled={isSubmitting}
                    onClick={handleSubmit}
                    className="text-white w-full relative bg-[#e20878] hover:bg-pink-800 transition rounded-md text-sm px-6 py-3 !mt-6 disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin h-5 w-5 mr-3"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16px"
                          height="16px"
                          fill="#fff"
                          className="mr-2 inline"
                          viewBox="0 0 548.244 548.244"
                        >
                          <path
                            fillRule="evenodd"
                            d="M392.19 156.054 211.268 281.667 22.032 218.58C8.823 214.168-.076 201.775 0 187.852c.077-13.923 9.078-26.24 22.338-30.498L506.15 1.549c11.5-3.697 24.123-.663 32.666 7.88 8.542 8.543 11.577 21.165 7.879 32.666L390.89 525.906c-4.258 13.26-16.575 22.261-30.498 22.338-13.923.076-26.316-8.823-30.728-22.032l-63.393-190.153z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Send Message
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Component>
  );
}

export default Contact;
