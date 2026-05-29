/**
 * Generates a clean, professional HTML email report of PathFinder career discovery.
 * Includes matched roles, scout comments, readiness progress, skill gaps, and 90-day roadmap.
 */
export function generateDiscoveryEmailHtml(userName, resultData) {
  const currentUrl = window.location.origin;
  const topRoleName = resultData.top_roles?.[0]?.role_name || "Data Analyst";
  const readiness = resultData.readiness_score || 78;
  const listRoles = (resultData.top_roles || [])
    .map((r, idx) => `
      <tr style="border-bottom: 1px dashed #E6E2D9;">
        <td style="padding: 12px 6px; font-family: monospace; font-size: 11px; color: #E8642A; width: 30px;">0${idx + 1}</td>
        <td style="padding: 12px 6px;">
          <div style="font-weight: 600; font-size: 15px; color: #111110;">${r.role_name}</div>
          <div style="font-family: monospace; font-size: 10px; color: #8a857a; margin-top: 2px;">${(r.skills_shown || []).join(' · ')}</div>
        </td>
        <td style="padding: 12px 6px; text-align: right; font-weight: bold; font-size: 18px; color: #E8642A;">${r.fit_score}%</td>
      </tr>
    `).join('');

  const listGaps = (resultData.skill_gaps || [])
    .map(sg => {
      const percentage = Math.round((sg.count / sg.total) * 100) || sg.pct || 50;
      return `
        <div style="margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 500; margin-bottom: 4px;">
            <span style="color: #111110;">${sg.skill}</span>
            <span style="font-weight: bold; color: #111110;">${sg.count || percentage}/${sg.total || 100} job</span>
          </div>
          <div style="height: 6px; background-color: #ECE9E2; border-radius: 3px; overflow: hidden; position: relative;">
            <div style="position: absolute; top:0; left:0; bottom:0; width: ${percentage}%; background-color: #E8642A; border-radius: 3px;"></div>
          </div>
        </div>
      `;
    }).join('');

  const listRoadmap = (resultData.visual_roadmap || [])
    .map(step => `
      <div style="display: flex; align-items: start; margin-bottom: 16px;">
        <div style="font-family: monospace; font-size: 12px; font-weight: bold; padding: 6px 10px; background-color: #F4F2EE; border: 1px solid #E6E2D9; border-radius: 6px; color: #E8642A; margin-right: 14px; text-align: center; width: 44px; shrink: 0;">
          H${step.day}
        </div>
        <div>
          <div style="font-weight: 600; font-size: 14px; color: #111110;">${step.title}</div>
          <div style="font-size: 13px; color: #5C5A54; margin-top: 2px;">${step.task}</div>
        </div>
      </div>
    `).join('');

  // Clean the scout comment HTML to flat text safely
  const rawScout = resultData.scout_message || "";
  const cleanScout = rawScout.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Laporan Karir PathFinder AI</title>
    </head>
    <body style="font-family: 'Inter', system-ui, -apple-system, sans-serif; background-color: #F4F2EE; margin: 0; padding: 24px; color: #111110; text-rendering: optimizeLegibility;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E6E2D9; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
        
        <!-- Header Banner -->
        <div style="background-color: #111110; padding: 24px 32px; color: #FFFFFF; position: relative;">
          <div style="font-size: 15px; font-weight: bold; margin-bottom: 16px; display: flex; align-items: center;">
            <span style="background-color: #E8642A; width: 14px; height: 14px; border-radius: 4px; display: inline-block; margin-right: 8px;"></span>
            <span style="letter-spacing: -0.01em;">PathFinder<span style="color:#E8642A;">·AI</span></span>
          </div>
          <h1 style="font-size: 24px; font-weight: 500; line-height: 1.2; margin: 0; tracking: -0.02em;">
            Laporan Kesiapan Karir ${userName || 'Teman'}
          </h1>
          <p style="font-size: 13px; color: #8a857a; margin: 8px 0 0 0; font-family: monospace;">
            Koneksi via Gmail · ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <!-- Main Content -->
        <div style="padding: 32px;">
          
          <!-- Intro / Scout message -->
          <div style="background-color: #FCE6D8; border-left: 4px solid #E8642A; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
            <div style="font-family: monospace; font-size: 10px; font-weight: bold; text-transform: uppercase; color: #E8642A; margin-bottom: 6px;">
              MASUKAN DARI PATHY (CAREER AGENT)
            </div>
            <p style="font-size: 14px; line-height: 1.5; color: #111110; margin: 0;">
              ${cleanScout}
            </p>
          </div>

          <!-- Readiness Index -->
          <div style="background-color: #111110; color: #FFFFFF; border-radius: 12px; padding: 20px 24px; margin-bottom: 24px; text-align: center;">
            <div style="font-size: 12px; font-family: monospace; letter-spacing: 0.1em; text-transform: uppercase; color: #8a857a; margin-bottom: 8px;">
              INDEKS KESIAPAN KERJA
            </div>
            <div style="font-size: 48px; font-weight: bold; color: #E8642A; line-height: 1;">
              ${readiness}% <span style="font-size: 16px; color: #FFFFFF; font-weight: normal; font-family: sans-serif; vertical-align: middle;">untuk ${topRoleName}</span>
            </div>
            <p style="font-size: 12px; color: #8a857a; margin: 10px 0 0 0; line-height: 1.4;">
              Indikator kesiapan dihitung berdasarkan kecocokan CV, kualifikasi, dan skill gap dari rekrutmen live di pasar Indonesia.
            </p>
          </div>

          <!-- Matched Roles Section -->
          <div style="margin-bottom: 28px;">
            <h3 style="font-size: 15px; text-transform: uppercase; font-family: monospace; letter-spacing: 0.08em; color: #8a857a; border-bottom: 1px solid #ECE9E2; padding-bottom: 8px; margin-top: 0; margin-bottom: 12px;">
              TOP MATCHING ROLES
            </h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tbody>
                ${listRoles}
              </tbody>
            </table>
          </div>

          <!-- Skill Gaps Section -->
          <div style="margin-bottom: 28px;">
            <h3 style="font-size: 15px; text-transform: uppercase; font-family: monospace; letter-spacing: 0.08em; color: #8a857a; border-bottom: 1px solid #ECE9E2; padding-bottom: 8px; margin-top: 0; margin-bottom: 12px;">
              SKILL GAPS UTAMA
            </h3>
            <div style="display: flex; flex-direction: column;">
              ${listGaps}
            </div>
          </div>

          <!-- Recommended Project Section -->
          ${resultData.project ? `
          <div style="border: 1px solid #E6E2D9; border-radius: 12px; padding: 20px; background-color: #FFFFFF; margin-bottom: 28px;">
            <div style="font-family: monospace; font-size: 10px; color: #E8642A; font-weight: bold; text-transform: uppercase; margin-bottom: 6px;">
              PROYEK REKOMENDASI UNTUK TUTUP GAP
            </div>
            <h4 style="font-size: 17px; font-weight: bold; color: #111110; margin: 0 0 10px 0;">
              ${resultData.project.name}
            </h4>
            <div style="margin-bottom: 12px;">
              <span style="font-family: monospace; font-size: 10px; background-color: #E8642A; color: #FFFFFF; padding: 3px 8px; border-radius: 4px; margin-right: 6px; display: inline-block;">
                ${(resultData.project.tech_stack || []).slice(0, 3).join(', ')}
              </span>
              <span style="font-family: monospace; font-size: 10px; background-color: #F4F2EE; color: #111110; padding: 3px 8px; border-radius: 4px; display: inline-block;">
                ${resultData.project.duration_weeks || 2} Minggu
              </span>
            </div>
            <p style="font-size: 13.5px; line-height: 1.5; color: #5C5A54; margin: 0;">
              <strong>Rencana Belajar:</strong><br/>
              ${resultData.project.week_1}<br/>
              ${resultData.project.week_2}
            </p>
          </div>
          ` : ''}

          <!-- Roadmap 90 Hari Section -->
          <div style="margin-bottom: 28px;">
            <h3 style="font-size: 15px; text-transform: uppercase; font-family: monospace; letter-spacing: 0.08em; color: #8a857a; border-bottom: 1px solid #ECE9E2; padding-bottom: 8px; margin-top: 0; margin-bottom: 16px;">
              90-DAY ACTION PLAN
            </h3>
            <div>
              ${listRoadmap}
            </div>
          </div>

          <!-- Back to App Call to Action -->
          <div style="text-align: center; margin-top: 36px; padding-top: 24px; border-top: 1px solid #ECE9E2;">
            <p style="font-size: 13.5px; color: #5C5A54; margin: 0 0 16px 0;">
              Simpan laporan ini atau masuk kembali ke dashboard kapan saja untuk melanjutkan progress project kamu.
            </p>
            <a href="${currentUrl}" target="_blank" style="display: inline-block; background-color: #E8642A; color: #FFFFFF; font-weight: bold; font-size: 14.5px; text-decoration: none; padding: 12px 28px; border-radius: 12px; box-shadow: 0 3px 8px rgba(232,100,42,0.2);">
              Akses Dashboard Karir Kamu
            </a>
          </div>

        </div>

        <!-- Footer -->
        <div style="background-color: #F4F2EE; border-top: 1px solid #E6E2D9; padding: 16px 32px; text-align: center; font-family: monospace; font-size: 11px; color: #8a857a;">
          Email dikirim via Google Workspace Integration oleh PathFinder AI.<br/>
          © 2026 PathFinder AI. Hak Cipta Dilindungi Undang-Undang.
        </div>

      </div>
    </body>
    </html>
  `;
}

/**
 * Generates an email message containing a pure Gmail OTP Magic link fallback.
 */
export function generateMagicLinkEmailHtml(userName, magicLinkUrl) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
    </head>
    <body style="font-family: 'Inter', system-ui, sans-serif; background-color: #F4F2EE; margin: 0; padding: 24px; color: #111110;">
      <div style="max-width: 480px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E6E2D9; border-radius: 16px; overflow: hidden; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
        <div style="font-size: 15px; font-weight: bold; margin-bottom: 24px;">
          <span style="background-color: #E8642A; width: 12px; height: 12px; border-radius: 3px; display: inline-block; margin-right: 6px;"></span>
          PathFinder<span style="color:#E8642A;">·AI</span>
        </div>
        
        <h2 style="font-size: 20px; font-weight: 600; margin-top: 0; margin-bottom: 12px;">Magic Link Masuk Kamu</h2>
        <p style="font-size: 14px; line-height: 1.5; color: #5C5A54; margin-bottom: 24px;">
          Halo ${userName || 'User'},<br/>
          Kamu menerima email ini karena kamu (atau seseorang) meminta magic link untuk masuk ke akun PathFinder AI kamu.
        </p>

        <div style="text-align: center; margin-bottom: 28px;">
          <a href="${magicLinkUrl}" target="_blank" style="display: inline-block; background-color: #111110; color: #FFFFFF; font-weight: 500; font-size: 14px; text-decoration: none; padding: 12px 28px; border-radius: 10px;">
            Masuk Sekarang (Tanpa Password)
          </a>
        </div>

        <p style="font-size: 12px; line-height: 1.5; color: #8a857a; margin-bottom: 0;">
          Link ini akan kadaluarsa dalam waktu 15 menit. Jika kamu tidak merasa meminta link ini, silakan abaikan email ini dengan aman.
        </p>
      </div>
    </body>
    </html>
  `;
}
