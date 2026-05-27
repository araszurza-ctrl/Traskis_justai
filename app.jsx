import React, { useState, useEffect } from 'react';
import './App.css';

export default function TraskioApp() {
  // Produktai su kainomis ir savikainom
  const initialProducts = [
    { id: 1, name: 'Peteliai 4 vnt', price: 6.5, cost: 1.87 },
    { id: 2, name: 'Peteliai 6 vnt', price: 8.5, cost: 2.8 },
    { id: 3, name: 'Sparneliai 4 vnt', price: 6.0, cost: 2.2 },
    { id: 4, name: 'Sparneliai 6 vnt', price: 6.6, cost: 2.57 },
    { id: 5, name: 'Aštri vištiena 4 vnt', price: 6.5, cost: 1.88 },
    { id: 6, name: 'Aštri vištiena 6 vnt', price: 8.9, cost: 2.7 },
    { id: 7, name: 'Fish & chips', price: 7.9, cost: 2.45 },
    { id: 8, name: 'Bulvytės', price: 3.0, cost: 0.4 },
  ];

  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('traskis-products');
    return saved ? JSON.parse(saved) : initialProducts.map(p => ({ ...p, qty: 0 }));
  });

  const [activeTab, setActiveTab] = useState('pardavimai');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    localStorage.setItem('traskis-products', JSON.stringify(products));
  }, [products]);

  const updateQty = (id, qty) => {
    setProducts(products.map(p =>
      p.id === id ? { ...p, qty: Math.max(0, Number(qty) || 0) } : p
    ));
  };

  const calculateTotals = (prods) => {
    return prods.reduce(
      (acc, p) => ({
        revenue: acc.revenue + p.qty * p.price,
        cost: acc.cost + p.qty * p.cost,
        profit: acc.profit + p.qty * (p.price - p.cost),
      }),
      { revenue: 0, cost: 0, profit: 0 }
    );
  };

  const totals = calculateTotals(products);

  const clearDay = () => {
    if (window.confirm('Išvalyti šios dienos duomenis?')) {
      setProducts(products.map(p => ({ ...p, qty: 0 })));
    }
  };

  const exportPDF = () => {
    const html = `
      <html>
        <head>
          <title>Traškis Justiniškių - Ataskaita</title>
          <style>
            body { font-family: Arial; margin: 20px; background: #f5f5f5; }
            h1 { color: #d32f2f; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; background: white; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #d32f2f; color: white; font-weight: bold; }
            .totals { font-size: 16px; font-weight: bold; margin: 20px 0; background: white; padding: 15px; border-radius: 8px; }
            .footer { text-align: center; color: #666; margin-top: 30px; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>🍗 Traškis Justiniškių</h1>
          <p style="text-align: center;">Pelno ir Kontrolės Sistema</p>
          <p style="text-align: center; color: #666;">Data: ${new Date().toLocaleDateString('lt-LT')}</p>
          
          <h2 style="color: #333; margin-top: 30px;">📊 Pardavimų Suvestinė</h2>
          <table>
            <tr>
              <th>Produktas</th>
              <th>Kiekis</th>
              <th>Kaina (€)</th>
              <th>Pajamos (€)</th>
              <th>Savikaina (€)</th>
              <th>Pelnas (€)</th>
            </tr>
            ${products.filter(p => p.qty > 0).map(p => `
              <tr>
                <td>${p.name}</td>
                <td>${p.qty}</td>
                <td>${p.price.toFixed(2)}</td>
                <td>${(p.qty * p.price).toFixed(2)}</td>
                <td>${(p.qty * p.cost).toFixed(2)}</td>
                <td>${(p.qty * (p.price - p.cost)).toFixed(2)}</td>
              </tr>
            `).join('')}
          </table>

          <div class="totals">
            <p>💰 Iš viso Pajamos: €${totals.revenue.toFixed(2)}</p>
            <p>📉 Iš viso Savikaina: €${totals.cost.toFixed(2)}</p>
            <p>🎯 Iš viso Pelnas: €${totals.profit.toFixed(2)}</p>
            <p>📈 Pelningumas: ${totals.revenue > 0 ? ((totals.profit / totals.revenue) * 100).toFixed(1) : 0}%</p>
          </div>

          <div class="footer">
            <p>Sukurta: Traškis Justiniškių Pelno ir Kontrolės Sistema</p>
            <p>© 2026 | www.traskis.lt</p>
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Traskis-Ataskaita-${new Date().toISOString().split('T')[0]}.html`;
    link.click();
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🍗 Traškis Justiniškių</h1>
        <p>Pelno ir Kontrolės Sistema</p>
      </header>

      <nav className="nav">
        <button
          className={`nav-btn ${activeTab === 'pardavimai' ? 'active' : ''}`}
          onClick={() => setActiveTab('pardavimai')}
        >
          📋 Pardavimai
        </button>
        <button
          className={`nav-btn ${activeTab === 'diena' ? 'active' : ''}`}
          onClick={() => setActiveTab('diena')}
        >
          📅 Diena
        </button>
        <button
          className={`nav-btn ${activeTab === 'savaitė' ? 'active' : ''}`}
          onClick={() => setActiveTab('savaitė')}
        >
          📊 Savaitė
        </button>
        <button
          className={`nav-btn ${activeTab === 'mėnesis' ? 'active' : ''}`}
          onClick={() => setActiveTab('mėnesis')}
        >
          📈 Mėnesis
        </button>
      </nav>

      <main className="content">
        {activeTab === 'pardavimai' && (
          <section>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>💰 Pajamos</h3>
                <p className="stat-value">€{totals.revenue.toFixed(2)}</p>
              </div>
              <div className="stat-card">
                <h3>📉 Savikaina</h3>
                <p className="stat-value">€{totals.cost.toFixed(2)}</p>
              </div>
              <div className="stat-card highlight">
                <h3>🎯 Dienos Pelnas</h3>
                <p className="stat-value">€{totals.profit.toFixed(2)}</p>
              </div>
            </div>

            <div className="products-section">
              <h2>Suveski Pardavimus</h2>
              <div className="products-grid">
                {products.map(p => (
                  <div key={p.id} className="product-card">
                    <h4>{p.name}</h4>
                    <div className="product-info">
                      <p>Kaina: <strong>€{p.price}</strong></p>
                      <p>Savikaina: <strong>€{p.cost}</strong></p>
                    </div>
                    <div className="product-input">
                      <input
                        type="number"
                        min="0"
                        value={p.qty}
                        onChange={(e) => updateQty(p.id, e.target.value)}
                        placeholder="Kiekis"
                      />
                      <span className="unit">vnt</span>
                    </div>
                    <div className="product-profit">
                      Pelnas: €{(p.qty * (p.price - p.cost)).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="action-buttons">
              <button className="btn btn-danger" onClick={clearDay}>
                🗑️ Išvalyti Dieną
              </button>
              <button className="btn btn-primary" onClick={exportPDF}>
                📄 Eksportuoti PDF
              </button>
            </div>
          </section>
        )}

        {activeTab === 'diena' && (
          <section className="report-section">
            <h2>📅 Dienos Ataskaita</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>💰 Pajamos</h3>
                <p className="stat-value">€{totals.revenue.toFixed(2)}</p>
              </div>
              <div className="stat-card">
                <h3>📉 Savikaina</h3>
                <p className="stat-value">€{totals.cost.toFixed(2)}</p>
              </div>
              <div className="stat-card highlight">
                <h3>🎯 Pelnas</h3>
                <p className="stat-value">€{totals.profit.toFixed(2)}</p>
              </div>
              <div className="stat-card">
                <h3>📊 Pelningumas</h3>
                <p className="stat-value">
                  {totals.revenue > 0 ? ((totals.profit / totals.revenue) * 100).toFixed(1) : 0}%
                </p>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'savaitė' && (
          <section className="report-section">
            <h2>📊 Savaitės Ataskaita</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>💰 Savaitės Pajamos</h3>
                <p className="stat-value">€{(totals.revenue * 7).toFixed(2)}</p>
              </div>
              <div className="stat-card">
                <h3>📉 Savaitės Savikaina</h3>
                <p className="stat-value">€{(totals.cost * 7).toFixed(2)}</p>
              </div>
              <div className="stat-card highlight">
                <h3>🎯 Savaitės Pelnas</h3>
                <p className="stat-value">€{(totals.profit * 7).toFixed(2)}</p>
              </div>
              <div className="stat-card">
                <h3>📈 Vidutinis Dieninis Pelnas</h3>
                <p className="stat-value">€{totals.profit.toFixed(2)}</p>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'mėnesis' && (
          <section className="report-section">
            <h2>📈 Mėnesio Ataskaita</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>💰 Mėnesio Pajamos</h3>
                <p className="stat-value">€{(totals.revenue * 30).toFixed(2)}</p>
              </div>
              <div className="stat-card">
                <h3>📉 Mėnesio Savikaina</h3>
                <p className="stat-value">€{(totals.cost * 30).toFixed(2)}</p>
              </div>
              <div className="stat-card highlight">
                <h3>🎯 Mėnesio Pelnas</h3>
                <p className="stat-value">€{(totals.profit * 30).toFixed(2)}</p>
              </div>
              <div className="stat-card">
                <h3>📊 Pelningumas</h3>
                <p className="stat-value">
                  {totals.revenue > 0 ? ((totals.profit / totals.revenue) * 100).toFixed(1) : 0}%
                </p>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="footer">
        <p>🍗 Traškis Justiniškių © 2026 | Sėkmės jūsų bizniui! 🚀</p>
      </footer>
    </div>
  );
}