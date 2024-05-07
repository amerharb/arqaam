import React, {useState} from 'react';
import './App.css';
import {useCallback} from 'react';

function App() {
    type Lang = { code: string, display: string, flag?: string }
    const langList: Lang[] = [
        {code: 'en', display: 'English', flag: '🇬🇧'},
        {code: 'sv', display: 'Swedish', flag: '🇸🇪'},
        {code: 'ar', display: 'Arabic', flag: '🇵🇸'},
        {code: 'fa', display: 'Farsi', flag: '🇮🇷'},
    ];
    const [lang, setSelectedLanguage] = useState(langList[0]);

    const handleLanguageChange = (lang: Lang) => {
        setSelectedLanguage(lang);
    };

    const playSound = useCallback(async (langCode: string, n: number) => {
        try {
            const audio = new Audio(`/sounds/${langCode}/${n}.ogg`);
            await audio.play();
        } catch (e) {
            console.error(e);
        }
    }, []);

    return (
        <div className="Arqam">
            <h1>Arqaam Web</h1>
            <hgroup>
                {langList.map((l) => (
                    <button
                        key={`lang-${l.code}`}
                        className={l.code === lang.code ? 'down' : 'up'}
                        onClick={() => handleLanguageChange(l)}
                    >
                        {l.flag}{' '}{l.display}
                    </button>
                ))}
            </hgroup>
            <button onClick={() => playSound(lang.code, 0)}>0</button>
            <button onClick={() => playSound(lang.code, 1)}>1</button>
            <button onClick={() => playSound(lang.code, 2)}>2</button>
            <button onClick={() => playSound(lang.code, 3)}>3</button>
            <button onClick={() => playSound(lang.code, 4)}>4</button>
            <button onClick={() => playSound(lang.code, 5)}>5</button>
            <button onClick={() => playSound(lang.code, 6)}>6</button>
            <button onClick={() => playSound(lang.code, 7)}>7</button>
            <button onClick={() => playSound(lang.code, 8)}>8</button>
            <button onClick={() => playSound(lang.code, 9)}>9</button>
            <button onClick={() => playSound(lang.code, 10)}>10</button>
        </div>
    );
}

export default App;
