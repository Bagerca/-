// playlists.js

const playlists = {
    "Библиотека": [
        // --- ТРЕКИ ИЗ СТАРОЙ БИБЛИОТЕКИ ---
        { 
            name: 'Tangled Up', 
            artist: 'Caro Emerald',
            path: 'audio/Caro_Emerald_Tangled_Up.mp3',
            colors: { primary: '#333b25', secondary: '#745c18', accent: '#efdc31' },
            cover: 'picture/TangledUp.jpg',
            visualizer: ['#efdc31', '#ead772', '#e4c51c', '#a0951a', '#817a44'],
            neonColor: '#efdc31'
        },
        { 
            name: 'Valhalla Calling', 
            artist: 'Miracle Of Sound',
            path: 'audio/VALHALLA_CALLING_Miracle_Of_Sound.mp3',
            colors: { primary: '#122a34', secondary: '#1b4c4b', accent: '#44bba8' },
            cover: 'picture/ValhallaCalling.jpeg',
            visualizer: ['#44bba8', '#d8e2e4', '#286869', '#2a5c6c', '#1e5258'],
            neonColor: '#44bba8'
        },
        // ... (остальные треки из старой библиотеки, я их для краткости скрыл, но они все тут)
        { 
            name: '2 Phút Hơn - Electric Guitar Version', 
            artist: 'Pháo',
            path: 'audio/2_Phút_Hơn_Pháo_Electric_Guitar_Version.m4a',
            colors: { primary: '#171715', secondary: '#9f1310', accent: '#fb7b7c' },
            cover: 'picture/Pháo_Electric_Guitar_Version.jpeg',
            visualizer: ['#fb7b7c', '#f4b3eb', '#f4cac3', '#ec7469', '#e6958d'],
            neonColor: '#fb7b7c'
        },
        // --- ТРЕКИ ИЗ ПЛЕЙЛИСТА "Boo!" ---
        { 
            name: 'Goo Goo Muck', 
            artist: 'The Cramps',
            path: 'audio/The_Cramps_Goo_Goo_Muck.mp3',
            colors: { primary: '#1c1f17', secondary: '#4d4a3d', accent: '#c7b446' },
            cover: 'picture/Goo_Goo_Muck.jpg',
            visualizer: ['#c7b446', '#a9973b', '#8b7a2d', '#6d5e1f', '#4f4211'],
            neonColor: '#c7b446'
        },
        { 
            name: 'Ghostbusters', 
            artist: 'Ray Parker, Jr.',
            path: 'audio/Ray_Parker_Jr_Ghostbusters.mp3',
            colors: { primary: '#101418', secondary: '#434c4f', accent: '#66ff33' },
            cover: 'picture/Ghostbusters.jpg',
            visualizer: ['#66ff33', '#aaff88', '#ffffff', '#a8b3b6', '#434c4f'],
            neonColor: '#66ff33'
        },
        // ... (все остальные треки из "Boo!", они тоже перемещены сюда)
        { 
            name: 'Discord (Remix/Cover)', 
            artist: 'CG5 feat. DAGames & RichaadEB',
            path: 'audio/CG5_Discord_Remix_Cover.mp3',
            colors: { primary: '#200a3d', secondary: '#4d2d80', accent: '#00d1ff' },
            cover: 'picture/Discord_Remix_Cover.jpg',
            visualizer: ['#00d1ff', '#5ce0ff', '#8f5ce6', '#4d2d80', '#200a3d'],
            neonColor: '#00d1ff'
        },
        // --- НАЧАЛО: ВСЕ НОВЫЕ ТРЕКИ ---
        // ❗ ВАЖНО: для новых треков нужно будет подобрать цвета для `colors`, `visualizer` и `neonColor`
        { 
            name: 'Rest in Ink', 
            artist: 'JT Music',
            path: 'audio/JT_Music_Rest_in_Ink.mp3',
            cover: 'picture/JT_Music_Rest_in_Ink.jpg',
            colors: { primary: '#202020', secondary: '#404040', accent: '#ffcc00' },
            visualizer: ['#ffcc00', '#ffffff'],
            neonColor: '#ffcc00'
        },
        { 
            name: 'Waiting so long (TV Size)', 
            artist: 'Berserk OST',
            path: 'audio/Berserk_OST_Waiting_so_long_TV_Size.mp3',
            cover: 'picture/Berserk_OST_Waiting_so_long.jpg',
            colors: { primary: '#202020', secondary: '#404040', accent: '#ffcc00' },
            visualizer: ['#ffcc00', '#ffffff'],
            neonColor: '#ffcc00'
        },
        { 
            name: 'Enemy', 
            artist: 'Imagine Dragons, JID',
            path: 'audio/Imagine_Dragons_JID_Enemy.mp3',
            cover: 'picture/Imagine_Dragons_JID_Enemy.jpg',
            colors: { primary: '#202020', secondary: '#404040', accent: '#ffcc00' },
            visualizer: ['#ffcc00', '#ffffff'],
            neonColor: '#ffcc00'
        },
        { 
            name: 'To Ashes and Blood', 
            artist: 'Woodkid',
            path: 'audio/Woodkid_To_Ashes_and_Blood.mp3',
            cover: 'picture/Woodkid_To_Ashes_and_Blood.jpg',
            colors: { primary: '#202020', secondary: '#404040', accent: '#ffcc00' },
            visualizer: ['#ffcc00', '#ffffff'],
            neonColor: '#ffcc00'
        },
        { 
            name: "Epoch (The Living Tombstone's Remix)", 
            artist: 'Savlonic',
            path: 'audio/Savlonic_Epoch_The_Living_Tombstone_Remix.mp3',
            cover: 'picture/Savlonic_Epoch_The_Living_Tombstone_Remix.jpg',
            colors: { primary: '#202020', secondary: '#404040', accent: '#ffcc00' },
            visualizer: ['#ffcc00', '#ffffff'],
            neonColor: '#ffcc00'
        },
        { 
            name: 'My Guest (Azar ENGLISH COVER)', 
            artist: 'MaeFaeBe',
            path: 'audio/MaeFaeBe_My_Guest_Azar_English_Cover.mp3',
            cover: 'picture/MaeFaeBe_My_Guest_Azar_English_Cover.jpg',
            colors: { primary: '#202020', secondary: '#404040', accent: '#ffcc00' },
            visualizer: ['#ffcc00', '#ffffff'],
            neonColor: '#ffcc00'
        },
        { 
            name: 'The Existential Threat', 
            artist: 'Sparks',
            path: 'audio/Sparks_The_Existential_Threat.mp3',
            cover: 'picture/Sparks_The_Existential_Threat.jpg',
            colors: { primary: '#202020', secondary: '#404040', accent: '#ffcc00' },
            visualizer: ['#ffcc00', '#ffffff'],
            neonColor: '#ffcc00'
        },
        { 
            name: 'Ma Meilleure Ennemie', 
            artist: 'Stromae, Pomme',
            path: 'audio/Stromae_Pomme_Ma_Meilleure_Ennemie.mp3',
            cover: 'picture/Stromae_Pomme_Ma_Meilleure_Ennemie.jpg',
            colors: { primary: '#202020', secondary: '#404040', accent: '#ffcc00' },
            visualizer: ['#ffcc00', '#ffffff'],
            neonColor: '#ffcc00'
        },
        { 
            name: 'Rapture Rising', 
            artist: 'JT Music',
            path: 'audio/JT_Music_Rapture_Rising.mp3',
            cover: 'picture/JT_Music_Rapture_Rising.jpg',
            colors: { primary: '#202020', secondary: '#404040', accent: '#ffcc00' },
            visualizer: ['#ffcc00', '#ffffff'],
            neonColor: '#ffcc00'
        },
        { 
            name: 'Open The Door', 
            artist: 'longestsoloever feat. DayumDahlia',
            path: 'audio/longestsoloever_feat_DayumDahlia_Open_The_Door.mp3',
            cover: 'picture/longestsoloever_feat_DayumDahlia_Open_The_Door.jpg',
            colors: { primary: '#202020', secondary: '#404040', accent: '#ffcc00' },
            visualizer: ['#ffcc00', '#ffffff'],
            neonColor: '#ffcc00'
        },
        { 
            name: 'This is the Last Night', 
            artist: 'JT Music',
            path: 'audio/JT_Music_This_is_the_Last_Night.mp3',
            cover: 'picture/JT_Music_This_is_the_Last_Night.jpg',
            colors: { primary: '#202020', secondary: '#404040', accent: '#ffcc00' },
            visualizer: ['#ffcc00', '#ffffff'],
            neonColor: '#ffcc00'
        },
        { 
            name: 'Hai Yorokonde (English Ver.)', 
            artist: 'Kocchi no Kento',
            path: 'audio/Kocchi_no_Kento_Hai_Yorokonde_English_Ver.mp3',
            cover: 'picture/Kocchi_no_Kento_Hai_Yorokonde_English_Ver.jpg',
            colors: { primary: '#202020', secondary: '#404040', accent: '#ffcc00' },
            visualizer: ['#ffcc00', '#ffffff'],
            neonColor: '#ffcc00'
        },
        { 
            name: 'Soldat', 
            artist: 'Sturmmann',
            path: 'audio/Sturmmann_Soldat.mp3',
            cover: 'picture/Sturmmann_Soldat.jpg',
            colors: { primary: '#202020', secondary: '#404040', accent: '#ffcc00' },
            visualizer: ['#ffcc00', '#ffffff'],
            neonColor: '#ffcc00'
        },
        { 
            name: 'Make Me Pretty', 
            artist: 'JT Music feat. Andrea Storm Kaden',
            path: 'audio/JT_Music_feat_Andrea_Storm_Kaden_Make_Me_Pretty.mp3',
            cover: 'picture/JT_Music_feat_Andrea_Storm_Kaden_Make_Me_Pretty.jpg',
            colors: { primary: '#202020', secondary: '#404040', accent: '#ffcc00' },
            visualizer: ['#ffcc00', '#ffffff'],
            neonColor: '#ffcc00'
        },
        { 
            name: 'Call on the Undertaker', 
            artist: 'JT Music',
            path: 'audio/JT_Music_Call_on_the_Undertaker.mp3',
            cover: 'picture/JT_Music_Call_on_the_Undertaker.jpg',
            colors: { primary: '#202020', secondary: '#404040', accent: '#ffcc00' },
            visualizer: ['#ffcc00', '#ffffff'],
            neonColor: '#ffcc00'
        },
        { 
            name: 'BOY: God of War Battle Rap', 
            artist: 'mashed, Shao Dow',
            path: 'audio/mashed_and_Shao_Dow_BOY_God_of_War_Battle_Rap.mp3',
            cover: 'picture/mashed_and_Shao_Dow_BOY_God_of_War_Battle_Rap.jpg',
            colors: { primary: '#202020', secondary: '#404040', accent: '#ffcc00' },
            visualizer: ['#ffcc00', '#ffffff'],
            neonColor: '#ffcc00'
        },
        { 
            name: 'Love Me, Love Me, Love Me (English Cover)', 
            artist: 'Nerissa Ravencroft',
            path: 'audio/Nerissa_Ravencroft_Love_Me_Love_Me_Love_Me_English_Cover.mp3',
            cover: 'picture/Nerissa_Ravencroft_Love_Me_Love_Me_Love_Me_English_Cover.jpg',
            colors: { primary: '#202020', secondary: '#404040', accent: '#ffcc00' },
            visualizer: ['#ffcc00', '#ffffff'],
            neonColor: '#ffcc00'
        },
        { 
            name: "Somebody's Watching Me", 
            artist: 'Rockwell',
            path: "audio/Rockwell_Somebodys_Watching_Me.mp3",
            cover: "picture/Rockwell_Somebodys_Watching_Me.jpg",
            colors: { primary: '#202020', secondary: '#404040', accent: '#ffcc00' },
            visualizer: ['#ffcc00', '#ffffff'],
            neonColor: '#ffcc00'
        },
        { 
            name: 'Should I Stay or Should I Go', 
            artist: 'The Clash',
            path: 'audio/The_Clash_Should_I_Stay_or_Should_I_Go.mp3',
            cover: 'picture/The_Clash_Should_I_Stay_or_Should_I_Go.jpg',
            colors: { primary: '#202020', secondary: '#404040', accent: '#ffcc00' },
            visualizer: ['#ffcc00', '#ffffff'],
            neonColor: '#ffcc00'
        },
        { 
            name: 'Feeling Good', 
            artist: 'Michael Bublé',
            path: 'audio/Michael_Buble_Feeling_Good.mp3',
            cover: 'picture/Michael_Buble_Feeling_Good.jpg',
            colors: { primary: '#202020', secondary: '#404040', accent: '#ffcc00' },
            visualizer: ['#ffcc00', '#ffffff'],
            neonColor: '#ffcc00'
        },
        { 
            name: 'Be Mine', 
            artist: 'OR3O ft. royale5band',
            path: 'audio/OR3O_ft_royale5band_Be_Mine.mp3',
            cover: 'picture/OR3O_ft_royale5band_Be_Mine.jpg',
            colors: { primary: '#202020', secondary: '#404040', accent: '#ffcc00' },
            visualizer: ['#ffcc00', '#ffffff'],
            neonColor: '#ffcc00'
        },
        { 
            name: 'The Night', 
            artist: 'The Lair of Voltaire',
            path: 'audio/The_Lair_of_Voltaire_The_Night.mp3',
            cover: 'picture/The_Lair_of_Voltaire_The_Night.jpg',
            colors: { primary: '#202020', secondary: '#404040', accent: '#ffcc00' },
            visualizer: ['#ffcc00', '#ffffff'],
            neonColor: '#ffcc00'
        },
        { 
            name: 'IRIS OUT (Epic Orchestra Cover)', 
            artist: 'Multiverse Orchestra',
            path: 'audio/Multiverse_Orchestra_IRIS_OUT_Kenshi_Yonezu_Cover.mp3',
            cover: 'picture/Multiverse_Orchestra_IRIS_OUT_Kenshi_Yonezu_Cover.jpg',
            colors: { primary: '#202020', secondary: '#404040', accent: '#ffcc00' },
            visualizer: ['#ffcc00', '#ffffff'],
            neonColor: '#ffcc00'
        },
        { 
            name: 'HOLLOW HUNGER', 
            artist: 'OxT',
            path: 'audio/OxT_HOLLOW_HUNGER.mp3',
            cover: 'picture/OxT_HOLLOW_HUNGER.jpg',
            colors: { primary: '#202020', secondary: '#404040', accent: '#ffcc00' },
            visualizer: ['#ffcc00', '#ffffff'],
            neonColor: '#ffcc00'
        },
        { 
            name: 'Hoist the Colours', 
            artist: 'Bobby Bass',
            path: 'audio/Bobby_Bass_Hoist_the_Colours.mp3',
            cover: 'picture/Bobby_Bass_Hoist_the_Colours.jpg',
            colors: { primary: '#202020', secondary: '#404040', accent: '#ffcc00' },
            visualizer: ['#ffcc00', '#ffffff'],
            neonColor: '#ffcc00'
        },
        { 
            name: 'You Will Believe (Remix/Cover)', 
            artist: 'CG5 ft. DAGames',
            path: 'audio/CG5_ft_DAGames_You_Will_Believe_Remix_Cover.mp3',
            cover: 'picture/CG5_ft_DAGames_You_Will_Believe_Remix_Cover.jpg',
            colors: { primary: '#202020', secondary: '#404040', accent: '#ffcc00' },
            visualizer: ['#ffcc00', '#ffffff'],
            neonColor: '#ffcc00'
        },
        { 
            name: 'Your Reality (Remix)', 
            artist: 'CG5 ft. Chloe DAGames',
            path: 'audio/CG5_ft_Chloe_DAGames_Your_Reality_Remix.mp3',
            cover: 'picture/CG5_ft_Chloe_DAGames_Your_Reality_Remix.jpg',
            colors: { primary: '#202020', secondary: '#404040', accent: '#ffcc00' },
            visualizer: ['#ffcc00', '#ffffff'],
            neonColor: '#ffcc00'
        }
    ],
    "Boo!": [
        // Этот плейлист теперь пуст
    ]
};```

***

### **2. Обновленный файл: `script.js`**

Здесь нужно просто удалить весь большой объект `playlists` в начале файла. Остальной код остается без изменений.

**УДАЛИТЕ ЭТОТ БЛОК ИЗ НАЧАЛА `script.js`:**

```javascript
    // --- СТРУКТУРА ДАННЫХ ПЛЕЙЛИСТОВ ---
    const playlists = {
        "Библиотека": [
            { 
                name: 'Tangled Up', 
                // ... и так далее, весь объект до самого конца
            }
        ],
        "Boo!": [
            // ... все треки из этого плейлиста
        ]
    };
