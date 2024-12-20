import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const username = (e.currentTarget.username as HTMLInputElement).value;
    const password = (e.currentTarget.password as HTMLInputElement).value;

    // Dummy credentials
    if (username === 'aaa' && password === '123') {
      setLoggedIn(true);
    } else {
      setError('Invalid username or password');
    }
  };

  const handleLogout = () => {
    setLoggedIn(false);
  };

  if (!loggedIn) {
    return (
      <div className="login-container">
        <h1>Login</h1>
        <form onSubmit={handleLogin}>
          <div>
            <label htmlFor="username">Username:</label>
            <input type="text" id="username" name="username" required />
          </div>
          <div>
            <label htmlFor="password">Password:</label>
            <input type="password" id="password" name="password" required />
          </div>
          <button type="submit">Login</button>
        </form>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    );
  }

  return (
    <Router>
      <div className="dashboard-container">
        <div className="sidebar">
          <h2>Admin Menu</h2>
          <ul>
            <li>
              <Link to="/option1">Stok Durumu</Link>
            </li>
            <li>
              <Link to="/option2">Raporlama</Link>
            </li>
            <li>
              <Link to="/option3">Depo Modülü</Link>
            </li>
            <li>
              <Link to="/option4">Ürün Modülü</Link>
            </li>
          </ul>
          <button className="logout-btn" onClick={handleLogout}>
            Exit
          </button>
        </div>
        <div className="content">
          <Routes>
            <Route path="/option1" element={<Option1 />} />
            <Route path="/option2" element={<Option2 />} />
            <Route path="/option3" element={<Option3 />} />
            <Route path="/option4" element={<Option4 />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

interface Depot {
  depo_id: number;
  kapasite: number;
}

interface Product {
  urun_adi: string;
  fiyat: number;
  agirlik: number;
  miktar: number;
  depo_id: number;
}

function Option1() {
  const [depots, setDepots] = useState<Depot[]>([]); // Depo listesini tutuyoruz
  const [selectedDepot, setSelectedDepot] = useState<number | string>(''); // Seçilen depo
  const [products, setProducts] = useState<Product[]>([]); // Ürünleri tutuyoruz

  // Depoları getir
  useEffect(() => {
    fetch('http://localhost:5000/depolar')
      .then((res) => res.json())
      .then((data) => setDepots(data))
      .catch((err) => console.error(err));
  }, []);

  // Ürünleri getir
  useEffect(() => {
    const fetchAllProducts = () => {
      fetch('http://localhost:5000/urunler')
        .then((res) => res.json())
        .then((data) => setProducts(data))
        .catch((err) => console.error(err));
    };

    fetchAllProducts();
  }, []);

  // Seçilen depo_id'ye göre ürünleri listele
  const fetchProductsByDepot = (depoId: number | string) => {
    if (depoId === 'hepsi') {
      // "Hepsi" seçildiğinde tüm depoların ürünlerini getir
      fetch('http://localhost:5000/urunler')
        .then((res) => res.json())
        .then((data) => setProducts(data))
        .catch((err) => console.error(err));
    } else {
      // Seçilen depo_id'ye göre ürünleri getir
      fetch(`http://localhost:5000/urunler?depo_id=${depoId}`)
        .then((res) => res.json())
        .then((data) => setProducts(data))
        .catch((err) => console.error(err));
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Stok Listesi</h2>

      {/* Depo seçimi */}
      <div>
        <label htmlFor="depot">Depo Seç:</label>
        <select
          id="depot"
          value={selectedDepot}
          onChange={(e) => {
            const selectedId = e.target.value;
            setSelectedDepot(selectedId);
            fetchProductsByDepot(selectedId);
          }}
        >
          <option value="">Depo Seçiniz</option>
          <option value="hepsi">Hepsi</option>
          {depots.map((depot) => (
            <option key={depot.depo_id} value={depot.depo_id}>
              Depo {depot.depo_id}
            </option>
          ))}
        </select>
      </div>

      {/* Ürün listesi */}
      {selectedDepot && (
        <div>
          {selectedDepot === 'hepsi' ? (
            <h3>Tüm Depolar</h3>
          ) : (
            <h3>Depo {selectedDepot}</h3>
          )}
          <table style={{ marginTop: '20px', width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid black', padding: '8px' }}>Ürün Adı</th>
                <th style={{ border: '1px solid black', padding: '8px' }}>Fiyat</th>
                <th style={{ border: '1px solid black', padding: '8px' }}>Ağırlık</th>
                <th style={{ border: '1px solid black', padding: '8px' }}>Miktar</th>
                <th style={{ border: '1px solid black', padding: '8px' }}>Depo ID</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map((product) => (
                  <tr key={product.urun_adi}>
                    <td style={{ border: '1px solid black', padding: '8px' }}>
                      {product.urun_adi}
                    </td>
                    <td style={{ border: '1px solid black', padding: '8px' }}>{product.fiyat}</td>
                    <td style={{ border: '1px solid black', padding: '8px' }}>{product.agirlik}</td>
                    <td style={{ border: '1px solid black', padding: '8px' }}>{product.miktar}</td>
                    <td style={{ border: '1px solid black', padding: '8px' }}>{product.depo_id}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '8px' }}>
                    Bu depoda ürün bulunmuyor.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Option2() {
  return <h2>Raporlama</h2>;
}

function Option3() {
  const [capacity, setCapacity] = useState<number>(0); // Depo kapasitesini tutuyoruz
  const [depots, setDepots] = useState<Depot[]>([]); // Depoları tutuyoruz
  const [error, setError] = useState<string>(''); // Hata mesajları

  // Depoları almak için GET isteği yapıyoruz
  useEffect(() => {
    fetch('http://localhost:5000/depolar')
      .then((res) => res.json())
      .then((data) => {
        // Depoları kapasiteye göre sıralıyoruz
        setDepots(data); // Artık sıralı olarak dönecek, ek bir işlem yapmamıza gerek yok
      })
      .catch((err) => console.error(err));
  }, []);

  // Yeni depo eklemek için API'ye istek gönderme
  const addDepot = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (capacity <= 0) {
      setError('Kapasite sıfırdan büyük olmalıdır.');
      return;
    }

    // Depo ekleme API isteği
    fetch('http://localhost:5000/depolar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ kapasite: capacity }),
    })
      .then((res) => res.json())
      .then((data) => {
        // Yeni depo eklenince depoları tekrar getir
        setDepots((prevDepots) => [
          ...prevDepots,
          { depo_id: data.depo_id, kapasite: data.kapasite },
        ]);
        setCapacity(0); // Formu sıfırlıyoruz
        setError(''); // Hata mesajını sıfırlıyoruz
      })
      .catch((err) => {
        setError('Depo eklenirken bir hata oluştu.');
        console.error(err);
      });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Depo Modülü</h2>

      {/* Depo Ekleme Formu */}
      <form onSubmit={addDepot}>
        <div>
          <label htmlFor="capacity">Kapasite:</label>
          <input
            type="number"
            id="capacity"
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            required
          />
        </div>
        <button type="submit">Depo Ekle</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>

      {/* Depoların Listesi */}
      <h3>Depolar (Kapasiteye Göre)</h3>
      <table style={{ marginTop: '20px', width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid black', padding: '8px' }}>Depo ID</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Kapasite</th>
          </tr>
        </thead>
        <tbody>
          {depots.length > 0 ? (
            depots.map((depot) => (
              <tr key={depot.depo_id}>
                <td style={{ border: '1px solid black', padding: '8px' }}>{depot.depo_id}</td>
                <td style={{ border: '1px solid black', padding: '8px' }}>{depot.kapasite}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={2} style={{ textAlign: 'center', padding: '8px' }}>
                Depo bulunmuyor.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}




function Option4() {
  return <h2>Ürün Modülü</h2>;
}

export default App;
