import './Contact.css';

export default function Contact() {
    return (
        <>
        <div className="contact-container">
            <div className="input-form">
                <input name="name" placeholder="name"/>
                <input name="email" placeholder="email address"/>
                <input name="message" placeholder="message"/>
                <button>send</button>
            </div>
            <div className="contact-info-box">
                <div id="header1"><h1>LET'S <span className="line"></span></h1></div>
                <div id="header2"><h1><span className="line"></span> CONNECT</h1></div>
                <div className="contacts">
                    <h3>Project Manager: Sonia Cruze
                        @scruze@uci.edu
                    </h3>
                    <h3>Advisor: Professor David Copp 
                        @dcopp@uci.edu</h3>
                    <h3>Team:
                        @team.ucicubesat@gmail.com
                    </h3>
                </div>
            </div>
        </div>
        </>
    );
} 