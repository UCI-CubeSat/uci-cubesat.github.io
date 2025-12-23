import './Contact.css';

export default function Contact() {
    return (
        <div className="contact-container">
            <div className="contact-info-box">
                <div className="contact-header">
                    <div id="header1">
                        <h1>LET'S</h1>
                        <span className="line"></span>
                    </div>
                    <div id="header2">
                        <span className="line"></span>
                        <h1>CONNECT</h1>
                    </div>
                </div>
                <div className="contacts">
                    <div className="contact-card">
                        <span className="contact-label">Project Manager</span>
                        <span className="contact-name">Sonia Cruze</span>
                        <a href="mailto:scruze@uci.edu">scruze@uci.edu</a>
                    </div>
                    <div className="contact-card">
                        <span className="contact-label">Advisor</span>
                        <span className="contact-name">Professor David Copp</span>
                        <a href="mailto:dcopp@uci.edu">dcopp@uci.edu</a>
                    </div>
                    <div className="contact-card">
                        <span className="contact-label">Team Email</span>
                        <a href="mailto:team.ucicubesat@gmail.com">team.ucicubesat@gmail.com</a>
                    </div>
                </div>
            </div>
        </div>
    );
} 