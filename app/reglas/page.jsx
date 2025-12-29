export default function ReglasPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 text-center">
            Normas de Estadía
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Cumplir con las normas de estadía es un requerimiento del contrato. No respetar los siguientes puntos puede resultar en penalizaciones y pérdida del depósito.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Columna 1 */}
            <div className="space-y-6">
              <section className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6 border-l-4 border-green-500">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">DEPÓSITO</h2>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Se pide un depósito de $70.000 el cuál será devuelto al encontrar todo en condiciones y normas pautadas.  En caso de incumplimiento de normas, el depósito se tomará como parte de pago</span>
                  </li>
                </ul>
              </section>

              <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-l-4 border-blue-500">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">REQUISITOS GENERALES</h2>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Se deberá notificar cualquier disputa o queja por parte de vecinos de manera inmediata</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Los ruidos excesivos en cualquier caso y hora están prohibidos. Música y bullicio hasta las 00:00 hs permitidos como máximo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Bajo ninguna circunstancia hacer un pedido al vecino o asomarse a su propiedad</span>
                  </li>
                </ul>
              </section>

              <section className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-l-4 border-purple-500">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">VISITAS</h2>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    <span>A los huéspedes se les permite recibir un máximo de 15 personas durante la estadía (para dormir máximo 7 personas)</span>
                  </li>
                </ul>
              </section>

              <section className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-6 border-l-4 border-cyan-500">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-cyan-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17 16.99c-1.35 0-2.2.42-2.95.8-.65.33-1.18.6-2.05.6-.9 0-1.4-.25-2.05-.6-.75-.38-1.57-.8-2.95-.8s-2.2.42-2.95.8c-.65.33-1.17.6-2.05.6v1.95c1.35 0 2.2-.42 2.95-.8.65-.33 1.17-.6 2.05-.6s1.4.25 2.05.6c.75.38 1.57.8 2.95.8s2.2-.42 2.95-.8c.65-.33 1.18-.6 2.05-.6.9 0 1.4.25 2.05.6.75.38 1.58.8 2.95.8v-1.95c-.9 0-1.4-.25-2.05-.6-.75-.38-1.6-.8-2.95-.8z"/>
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">PILETA</h2>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-500 mt-1">•</span>
                    <span>Por razones de seguridad no se permite el uso de objetos de vidrio cerca de la piscina</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-500 mt-1">•</span>
                    <span>Se requiere que al momento de acercamiento a la piscina todo infante o niño sea supervisado por adulto responsable</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-500 mt-1">•</span>
                    <span>No está permitido el ingreso de mascotas a la misma</span>
                  </li>
                </ul>
              </section>

              <section className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border-l-4 border-amber-500">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">MASCOTAS</h2>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-1">•</span>
                    <span>Permitido mascotas pequeñas en los usos comunes, no pileta. Mantener parque libre de heces</span>
                  </li>
                </ul>
              </section>
            </div>

            {/* Columna 2 */}
            <div className="space-y-6">
              <section className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 border-l-4 border-indigo-500">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">SEGURIDAD</h2>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 mt-1">•</span>
                    <span>Siempre que los huéspedes salgan de la propiedad, está bajo su responsabilidad asegurarse de que las ventanas y puertas estén bien cerradas para mantener la seguridad y prevenir daños</span>
                  </li>
                </ul>
              </section>

              <section className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl p-6 border-l-4 border-sky-500">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">USO DE LA PROPIEDAD</h2>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-sky-500 mt-1">•</span>
                    <span>Cualquier pequeña reunión deberá tener en cuenta las normas ya expresadas, en cuanto a ruido, vecindario y visitas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sky-500 mt-1">•</span>
                    <span>La propiedad cuenta con vajilla completa para 10 personas y 5 plazas para dormir</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sky-500 mt-1">•</span>
                    <span>Las instalaciones no cuentan con ropa blanca, la cual deberá ser provista por el huésped</span>
                  </li>
                </ul>
              </section>

              <section className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-6 border-l-4 border-red-500">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">TABACO</h2>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>Fumar no está permitido dentro de la propiedad. Las colillas deberán ir en ceniceros dispuestos para ello y no al suelo</span>
                  </li>
                </ul>
              </section>

              <section className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6 border-l-4 border-emerald-500">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">BASURA Y RECICLAJE</h2>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-1">•</span>
                    <span>Los huéspedes y sus visitas no dejarán ningún tipo de residuos en áreas comunes ni zonas públicas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-1">•</span>
                    <span>La propiedad cuenta con tachos de basura con bolsas y sistema de contenedor público a pocos metros frente a la casa</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-1">•</span>
                    <span>Mantener la higiene acelera el proceso de devolución del depósito</span>
                  </li>
                </ul>
              </section>

              <section className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border-l-4 border-orange-500">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">CUMPLIMIENTO</h2>
                </div>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>El propietario tiene derecho a terminar el período de estancia del huésped si éste causa disturbios o incidentes</span>
                  </li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


