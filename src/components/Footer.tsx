import '../styles/Footer.css';

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-info">
          <p className="footer-credits">
            기획, 디자인, 프론트엔드, 백엔드: <strong>김경민, Claude</strong>
          </p>
          <p className="footer-links">
            <a
              href="https://github.com/kkm06100"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              GitHub: kkm06100
            </a>
            <span className="footer-separator"> | </span>
            <a
              href="https://github.com/DeukNet"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              GitHub: DeukNet
            </a>
          </p>
        </div>
        <p className="footer-copyright">
          &copy; {new Date().getFullYear()} DeukNet. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
