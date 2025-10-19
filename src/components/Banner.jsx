import '../styles/Banner.css';
import logo from '../assets/logo.png'
function Banner() {
    const title = 'La maison jungle';
    const number = [1, 2, 3, 4, 5];
    const doubleNumber = number.map((num) => num * 2);

  return (
    
       <div className='lmj-banner'>
            <img src={logo} alt='La maison jungle' className='lmj-logo' />
            <h1 className='lmj-title'>{title}</h1>
            <p>{doubleNumber.join(', ')}</p>
        </div>
  );
}

export default Banner;