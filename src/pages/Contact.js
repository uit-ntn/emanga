import React, { useState } from "react";
import Layout from "../components/Layout";

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const [formStatus, setFormStatus] = useState({
        submitted: false,
        error: false,
        message: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate form data
        if (!formData.name || !formData.email || !formData.message) {
            setFormStatus({
                submitted: true,
                error: true,
                message: 'Please fill in all required fields.'
            });
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setFormStatus({
                submitted: true,
                error: true,
                message: 'Please enter a valid email address.'
            });
            return;
        }

        // Simulate API call with timeout
        setFormStatus({
            submitted: true,
            error: false,
            message: 'Sending your message...'
        });

        setTimeout(() => {
            // In a real app, you would send the data to your backend here
            console.log("Form submitted:", formData);

            setFormStatus({
                submitted: true,
                error: false,
                message: 'Your message has been sent successfully! We will get back to you soon.'
            });

            // Reset form
            setFormData({
                name: '',
                email: '',
                subject: '',
                message: ''
            });
        }, 1500);
    };

    return (
        <Layout>
            <div className="Contact py-5">
                <div className="container">
                    {/* Header Section */}
                    <div className="row mb-5">
                        <div className="col-12 text-center">
                            <h1 className="display-4 fw-bold text-primary mb-4">Contact Us</h1>
                            <div className="divider-custom mx-auto mb-4">
                                <div className="divider-custom-line bg-secondary" style={{ height: "4px", width: "80px", margin: "0 auto" }}></div>
                            </div>
                            <p className="lead text-muted mx-auto" style={{ maxWidth: "700px" }}>
                                Have questions, feedback, or issues? We're here to help!
                                Get in touch with our team using the form below or through our other contact channels.
                            </p>
                        </div>
                    </div>

                    <div className="row">
                        {/* Contact Information */}
                        <div className="col-lg-4 mb-4 mb-lg-0">
                            <div className="bg-dark text-white rounded-3 p-4 h-100">
                                <h3 className="fw-bold mb-4">Get In Touch</h3>

                                <div className="mb-4">
                                    <h5 className="fw-bold">Our Location</h5>
                                    <address className="mb-0 text-light">
                                        <i className="bi bi-geo-alt-fill me-2 text-primary"></i>
                                        University of Information Technology<br />
                                        VNU-HCM<br />
                                        Thu Duc City, Ho Chi Minh City
                                    </address>
                                </div>

                                <div className="mb-4">
                                    <h5 className="fw-bold">Contact Information</h5>
                                    <p className="mb-2">
                                        <i className="bi bi-telephone-fill me-2 text-primary"></i>
                                        <a href="tel:0823346347" className="text-light text-decoration-none">0823 346 347</a>
                                    </p>
                                    <p className="mb-0">
                                        <i className="bi bi-envelope-fill me-2 text-primary"></i>
                                        <a href="mailto:21521219@gm.uit.edu.vn" className="text-light text-decoration-none">21521219@gm.uit.edu.vn</a>
                                    </p>
                                </div>

                                <div className="mb-4">
                                    <h5 className="fw-bold">Working Hours</h5>
                                    <p className="mb-1">Monday - Friday: 9:00 AM - 5:00 PM</p>
                                    <p className="mb-0">Weekend: 10:00 AM - 3:00 PM</p>
                                </div>

                                <hr className="my-4 bg-light" />

                                <h5 className="fw-bold mb-3">Connect With Us</h5>
                                <div className="d-flex gap-2">
                                    <a href="https://www.facebook.com/UIT.NTN.13" className="btn btn-primary rounded-circle">
                                        <i className="bi bi-facebook"></i>
                                    </a>
                                    <a href="https://www.instagram.com/np_thanh_nhan/" className="btn btn-danger rounded-circle">
                                        <i className="bi bi-instagram"></i>
                                    </a>
                                    <a href="https://github.com/uit-ntn" className="btn btn-dark rounded-circle">
                                        <i className="bi bi-github"></i>
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="col-lg-8">
                            <div className="card border-0 shadow-sm rounded-3">
                                <div className="card-body p-4">
                                    <h3 className="fw-bold mb-4">Send Us A Message</h3>

                                    {formStatus.submitted && (
                                        <div className={`alert ${formStatus.error ? 'alert-danger' : 'alert-success'} d-flex align-items-center`} role="alert">
                                            <i className={`bi ${formStatus.error ? 'bi-exclamation-triangle-fill' : 'bi-check-circle-fill'} flex-shrink-0 me-2`}></i>
                                            <div>{formStatus.message}</div>
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit}>
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <label htmlFor="name" className="form-label">Your Name *</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="name"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    placeholder="Enter your name"
                                                    required
                                                />
                                            </div>

                                            <div className="col-md-6">
                                                <label htmlFor="email" className="form-label">Your Email *</label>
                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    id="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    placeholder="Enter your email"
                                                    required
                                                />
                                            </div>

                                            <div className="col-12">
                                                <label htmlFor="subject" className="form-label">Subject</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="subject"
                                                    name="subject"
                                                    value={formData.subject}
                                                    onChange={handleChange}
                                                    placeholder="What is this regarding?"
                                                />
                                            </div>

                                            <div className="col-12">
                                                <label htmlFor="message" className="form-label">Your Message *</label>
                                                <textarea
                                                    className="form-control"
                                                    id="message"
                                                    name="message"
                                                    value={formData.message}
                                                    onChange={handleChange}
                                                    rows="5"
                                                    placeholder="How can we help you?"
                                                    required
                                                ></textarea>
                                            </div>

                                            <div className="col-12">
                                                <div className="form-check">
                                                    <input className="form-check-input" type="checkbox" id="newsletter" />
                                                    <label className="form-check-label text-muted" htmlFor="newsletter">
                                                        Subscribe to our newsletter for updates on new manga releases and features
                                                    </label>
                                                </div>
                                            </div>

                                            <div className="col-12">
                                                <button type="submit" className="btn btn-primary btn-lg py-2 px-4">
                                                    <i className="bi bi-send me-2"></i>Send Message
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Map Section */}
                    <div className="row mt-5">
                        <div className="col-12">
                            <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
                                <div className="card-body p-0">
                                    <iframe
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.2294112529766!2d106.80024937465036!3d10.869919957474858!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317527587e9ad5bf%3A0xafa66f9c8be3c91!2sUniversity%20of%20Information%20Technology%20VNU-HCM!5e0!3m2!1sen!2s!4v1684661966594!5m2!1sen!2s"
                                        width="100%"
                                        height="450"
                                        style={{ border: 0 }}
                                        allowFullScreen=""
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title="UIT map"
                                    ></iframe>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FAQ Section */}
                    <div className="row mt-5">
                        <div className="col-12 text-center mb-4">
                            <h2 className="fw-bold">Frequently Asked Questions</h2>
                            <p className="text-muted">Find quick answers to common questions</p>
                        </div>

                        <div className="col-lg-6 mb-4">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-body p-4">
                                    <h5 className="fw-bold mb-3">Is eManga free to use?</h5>
                                    <p className="mb-0">
                                        Yes, eManga offers a free tier with access to thousands of manga titles.
                                        We also offer a premium subscription with additional features and early access to new releases.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-6 mb-4">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-body p-4">
                                    <h5 className="fw-bold mb-3">How can I report an issue with a manga?</h5>
                                    <p className="mb-0">
                                        You can report issues using the report button on each manga page or by contacting our support team
                                        through this contact form with details about the problem.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-6 mb-4 mb-lg-0">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-body p-4">
                                    <h5 className="fw-bold mb-3">Can I download manga for offline reading?</h5>
                                    <p className="mb-0">
                                        Premium subscribers have the option to download selected chapters for offline reading
                                        within our mobile apps. This feature is available on both iOS and Android devices.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-6">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-body p-4">
                                    <h5 className="fw-bold mb-3">How do I become a content contributor?</h5>
                                    <p className="mb-0">
                                        We're always looking for translation teams and content contributors. Please send us a message
                                        through the contact form with your experience and the titles you're interested in working on.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default Contact;