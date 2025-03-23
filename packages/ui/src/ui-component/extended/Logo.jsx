// import logo from '@/assets/images/flowise_logo.png'
// import logoDark from '@/assets/images/flowise_logo_dark.png'

import { useSelector } from 'react-redux'

const VITE_ASSETS_BASE_URL = import.meta.env.VITE_ASSETS_BASE_URL

// ==============================|| LOGO ||============================== //

const Logo = () => {
    const customization = useSelector((state) => state.customization)

    return (
        <div style={{ alignItems: 'center', display: 'flex', flexDirection: 'row' }}>
            <img
                // style={{ objectFit: 'contain', height: 'auto', width: 150 }}
                style={{ objectFit: 'contain', height: 32, width: 'auto' }}
                // src={customization.isDarkMode ? logoDark : logo}
                src={`${VITE_ASSETS_BASE_URL}/images/logo/text${customization.isDarkMode ? '-dark' : ''}.svg`}
                alt='Flowise'
            />
        </div>
    )
}

export default Logo
