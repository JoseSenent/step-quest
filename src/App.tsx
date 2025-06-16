import Level1 from "./pages/Level1";
import Level2 from "./pages/Level2";
import Level3 from "./pages/Level3";
import Level4 from "./pages/Level4";
import Level5 from "./pages/Level5";
import { Routes } from "./router/Routes";

export default function App() {
  return (
    <Routes
      routes={{
        "level-1": Level1,
        "level-2": Level2,
        "level-3": Level3,
        "level-4": Level4,
        "level-5": Level5,
      }}
    />
  );
}

// Burbujas Mantenidas: Debes tener la burbuja presionada un tiempo para conseguir exclamación.
// Burbuja Tocha: Toca una burbuja grande y se desperdiga en burbujas pequeñas que debes tocar todas.
// Burbuja Diferente: Aparecen muchas burbujas y debes tocar la que no sea igual.
// Burbuja Partida: Aparece con otras burbujas. Toca 4 y obtendrás una exclamación.
// Medias Burbujas: Sequencia de burbujas. Si tocas una mitad derecha, debes tocar luego la izquierda. O viceversa.
// Burbuja Llave y Cerradura. Aparece una burbuja hermética. Toca otra burbuja que aparece y entonces puedes tocar la hermética. Repite este bucle unas 4 veces y romperas la hermética.
// Burbuja Par/Impar: Son ascendentes. A mayor sea el número, mejor. Sin embargo debes terminar en par o impar, según la burbuja o de lo contrario perderás una exclamación.
// Burbuja Simón: Aparece una sequencia de burbujas. Al tocarlas cambia la figura. Tienes que hacer que todas sean iguales.
