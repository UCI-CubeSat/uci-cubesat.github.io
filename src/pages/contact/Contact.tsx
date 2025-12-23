import './Contact.css';

export default function Contact() {
    return (
        <>
        <div className="contact-container">
            {/* Temporarily disabled contact form
            <div className="input-form">
                <input name="name" placeholder="name"/>
                <input name="email" placeholder="email address"/>
                <input name="message" placeholder="message"/>
                <button>send</button>
            </div>
            */}
            <div className="contact-info-box">
                <div id="header1"><h1>LET'S <span className="line"></span></h1></div>
                <div id="header2"><h1><span className="line"></span> CONNECT</h1></div>
                <div className="contacts">
                    <h3>Project Manager: Sonia Cruze<br/>
                        <a href="mailto:scruze@uci.edu">scruze@uci.edu</a>
                    </h3>
                    <h3>Advisor: Professor David Copp<br/>
                        <a href="mailto:dcopp@uci.edu">dcopp@uci.edu</a>
                    </h3>
                    <h3>Team:<br/>
                        <a href="mailto:team.ucicubesat@gmail.com">team.ucicubesat@gmail.com</a>
                    </h3>
                </div>
            </div>
        </div>
        </>
    );
} 