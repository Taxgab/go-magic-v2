import { validateAlumno, validateAlumnoUpdate, alumnoSchema } from '@/lib/validation/alumno'

describe('Validación de Alumnos', () => {
  describe('validateAlumno', () => {
    it('debe validar un alumno completo correctamente', () => {
      const validData = {
        nombre: 'Juan Pérez',
        dni: '12345678',
        telefono: '11 1234-5678',
        email: 'juan@example.com',
        direccion: 'Calle Falsa 123',
        contacto_emergencia: 'María Pérez 11 8765-4321',
        medico: 'Dr. García',
        fecha_alta: '2024-01-15',
        estado: 'activo' as const,
      }

      const result = validateAlumno(validData)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.nombre).toBe('Juan Pérez')
        expect(result.data.email).toBe('juan@example.com')
      }
    })

    it('debe rechazar nombre vacío', () => {
      const invalidData = {
        nombre: '',
        fecha_alta: '2024-01-15',
        estado: 'activo' as const,
      }

      const result = validateAlumno(invalidData)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors.nombre).toBeDefined()
      }
    })

    it('debe rechazar nombre con menos de 2 caracteres', () => {
      const invalidData = {
        nombre: 'A',
        fecha_alta: '2024-01-15',
        estado: 'activo' as const,
      }

      const result = validateAlumno(invalidData)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors.nombre).toContain('2 caracteres')
      }
    })

    it('debe rechazar DNI inválido', () => {
      const invalidData = {
        nombre: 'Juan Pérez',
        dni: '123',
        fecha_alta: '2024-01-15',
        estado: 'activo' as const,
      }

      const result = validateAlumno(invalidData)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors.dni).toBeDefined()
      }
    })

    it('debe aceptar DNI con 7 dígitos', () => {
      const validData = {
        nombre: 'Juan Pérez',
        dni: '1234567',
        fecha_alta: '2024-01-15',
        estado: 'activo' as const,
      }

      const result = validateAlumno(validData)

      expect(result.success).toBe(true)
    })

    it('debe aceptar DNI con 8 dígitos', () => {
      const validData = {
        nombre: 'Juan Pérez',
        dni: '12345678',
        fecha_alta: '2024-01-15',
        estado: 'activo' as const,
      }

      const result = validateAlumno(validData)

      expect(result.success).toBe(true)
    })

    it('debe rechazar email inválido', () => {
      const invalidData = {
        nombre: 'Juan Pérez',
        email: 'email-invalido',
        fecha_alta: '2024-01-15',
        estado: 'activo' as const,
      }

      const result = validateAlumno(invalidData)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors.email).toBeDefined()
      }
    })

    it('debe aceptar campos opcionales nulos', () => {
      const validData = {
        nombre: 'Juan Pérez',
        dni: null,
        telefono: null,
        email: null,
        direccion: null,
        contacto_emergencia: null,
        medico: null,
        fecha_alta: '2024-01-15',
        estado: 'activo' as const,
      }

      const result = validateAlumno(validData)

      expect(result.success).toBe(true)
    })

    it('debe rechazar teléfono con menos de 8 caracteres', () => {
      const invalidData = {
        nombre: 'Juan Pérez',
        telefono: '123',
        fecha_alta: '2024-01-15',
        estado: 'activo' as const,
      }

      const result = validateAlumno(invalidData)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors.telefono).toBeDefined()
      }
    })

    it('debe hacer trim al nombre', () => {
      const data = {
        nombre: '  Juan Pérez  ',
        fecha_alta: '2024-01-15',
        estado: 'activo' as const,
      }

      const result = validateAlumno(data)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.nombre).toBe('Juan Pérez')
      }
    })

    it('debe validar formato de fecha', () => {
      const invalidData = {
        nombre: 'Juan Pérez',
        fecha_alta: '15-01-2024', // Formato incorrecto
        estado: 'activo' as const,
      }

      const result = validateAlumno(invalidData)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors.fecha_alta).toBeDefined()
      }
    })
  })

  describe('validateAlumnoUpdate', () => {
    it('debe permitir actualización parcial', () => {
      const partialData = {
        nombre: 'Juan Pérez Actualizado',
      }

      const result = validateAlumnoUpdate(partialData)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.nombre).toBe('Juan Pérez Actualizado')
      }
    })

    it('debe permitir actualizar solo el teléfono', () => {
      const partialData = {
        telefono: '11 9999-8888',
      }

      const result = validateAlumnoUpdate(partialData)

      expect(result.success).toBe(true)
    })

    it('debe rechazar nombre inválido en actualización parcial', () => {
      const invalidData = {
        nombre: 'A',
      }

      const result = validateAlumnoUpdate(invalidData)

      expect(result.success).toBe(false)
    })

    it('debe permitir actualizar el estado', () => {
      const data = {
        estado: 'inactivo' as const,
      }

      const result = validateAlumnoUpdate(data)

      expect(result.success).toBe(true)
    })

    it('debe rechazar estado inválido', () => {
      const data = {
        estado: 'suspendido' as 'activo', // Forzando tipo incorrecto
      }

      const result = validateAlumnoUpdate(data)

      expect(result.success).toBe(false)
    })
  })

  describe('alumnoSchema', () => {
    it('debe tener los campos requeridos correctos', () => {
      const requiredFields = ['nombre', 'fecha_alta']

      // Verificar que los campos requeridos causan error si faltan
      requiredFields.forEach(field => {
        const data = {
          nombre: 'Test',
          fecha_alta: '2024-01-15',
          estado: 'activo' as const,
        }
        delete (data as Record<string, unknown>)[field]

        const result = alumnoSchema.safeParse(data)
        expect(result.success).toBe(false)
      })
    })

    it('debe aceptar valores máximos de longitud', () => {
      const data = {
        nombre: 'A'.repeat(100), // Longitud máxima
        direccion: 'A'.repeat(200),
        contacto_emergencia: 'A'.repeat(200),
        medico: 'A'.repeat(200),
        fecha_alta: '2024-01-15',
        estado: 'activo' as const,
      }

      const result = alumnoSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('debe rechazar nombres demasiado largos', () => {
      const data = {
        nombre: 'A'.repeat(101), // Excede longitud máxima
        fecha_alta: '2024-01-15',
        estado: 'activo' as const,
      }

      const result = alumnoSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })
})
