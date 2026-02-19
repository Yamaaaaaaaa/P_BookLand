import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import '../styles/components/footer.css';
import { footerLinks } from '../data/mockNavigation';
import { useTranslation } from 'react-i18next';

const Footer = () => {
    const { t } = useTranslation();

    return (
        <footer className="shop-footer">
            <div className="shop-container">
                <div className="shop-footer__grid">
                    <div className="shop-footer__brand">
                        <div className="shop-footer__logo">BOOKSAW</div>
                        <p className="shop-footer__description">
                            {t('footer.description')}
                        </p>
                        <div className="shop-footer__social">
                            <a href="#" className="shop-footer__social-link" aria-label="Facebook">
                                <Facebook size={18} />
                            </a>
                            <a href="#" className="shop-footer__social-link" aria-label="Twitter">
                                <Twitter size={18} />
                            </a>
                            <a href="#" className="shop-footer__social-link" aria-label="Instagram">
                                <Instagram size={18} />
                            </a>
                            <a href="#" className="shop-footer__social-link" aria-label="Youtube">
                                <Youtube size={18} />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="shop-footer__column-title">{t('footer.company.title')}</h4>
                        <div className="shop-footer__links">
                            {footerLinks.company.map((link) => (
                                <Link key={link.href} to={link.href} className="shop-footer__link">
                                    {t(link.label)}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="shop-footer__column-title">{t('footer.help.title')}</h4>
                        <div className="shop-footer__links">
                            {footerLinks.help.map((link) => (
                                <Link key={link.href} to={link.href} className="shop-footer__link">
                                    {t(link.label)}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="shop-footer__column-title">{t('footer.resources.title')}</h4>
                        <div className="shop-footer__links">
                            {footerLinks.resources.map((link) => (
                                <Link key={link.href} to={link.href} className="shop-footer__link">
                                    {t(link.label)}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="shop-footer__bottom">
                    <p className="shop-footer__copyright">
                        {t('footer.copyright')}
                    </p>
                    <div className="shop-footer__payment">
                        <div className="shop-footer__payment-icon"></div>
                        <div className="shop-footer__payment-icon"></div>
                        <div className="shop-footer__payment-icon"></div>
                        <div className="shop-footer__payment-icon"></div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
