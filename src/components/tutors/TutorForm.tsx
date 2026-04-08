import { useState, useEffect } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { maskCpf, maskPhone, maskCep, validateCpf, validateEmail } from '@/lib/masks'
import type { Tutor } from '@/api/tutors.api'

interface TutorFormData {
  name: string
  cpf: string
  rg: string
  phone: string
  phoneSecondary: string
  email: string
  emails: string[] // emails adicionais
  street: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
  notes: string
}

interface TutorFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: Record<string, unknown>) => void
  loading: boolean
  initialData?: Tutor | null
  title: string
}

const STATES = [
  'AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT',
  'PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'
]

const emptyForm: TutorFormData = {
  name: '', cpf: '', rg: '', phone: '', phoneSecondary: '',
  email: '', emails: [], street: '', number: '', complement: '',
  neighborhood: '', city: '', state: '', zipCode: '', notes: '',
}

export function TutorForm({ open, onClose, onSubmit, loading, initialData, title }: TutorFormProps) {
  const [form, setForm] = useState<TutorFormData>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [newEmail, setNewEmail] = useState('')

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        cpf: initialData.cpf || '',
        rg: initialData.rg || '',
        phone: initialData.phone || '',
        phoneSecondary: initialData.phoneSecondary || '',
        email: initialData.email || '',
        emails: [],
        street: initialData.street || '',
        number: initialData.number || '',
        complement: initialData.complement || '',
        neighborhood: initialData.neighborhood || '',
        city: initialData.city || '',
        state: initialData.state || '',
        zipCode: initialData.zipCode || '',
        notes: initialData.notes || '',
      })
    } else {
      setForm(emptyForm)
    }
    setErrors({})
  }, [initialData, open])

  const validateField = (field: string) => {
    const errs = { ...errors }
    delete errs[field]

    switch (field) {
      case 'name':
        if (!form.name.trim()) errs.name = 'Nome obrigatório'
        else if (form.name.trim().length < 3) errs.name = 'Nome deve ter pelo menos 3 caracteres'
        break
      case 'cpf':
        if (form.cpf && !validateCpf(form.cpf)) errs.cpf = 'CPF inválido'
        break
      case 'phone':
        if (!form.phone.trim()) errs.phone = 'Telefone principal obrigatório'
        else if (form.phone.replace(/\D/g, '').length < 10) errs.phone = 'Telefone incompleto'
        break
      case 'email':
        if (form.email && !validateEmail(form.email)) errs.email = 'E-mail inválido'
        break
      case 'zipCode':
        if (form.zipCode && form.zipCode.replace(/\D/g, '').length > 0 && form.zipCode.replace(/\D/g, '').length < 8)
          errs.zipCode = 'CEP incompleto'
        break
    }

    setErrors(errs)
  }

  const validate = (): boolean => {
    const errs: Record<string, string> = {}

    if (!form.name.trim()) errs.name = 'Nome obrigatório'
    else if (form.name.trim().length < 3) errs.name = 'Nome deve ter pelo menos 3 caracteres'

    if (form.cpf && !validateCpf(form.cpf)) errs.cpf = 'CPF inválido'

    if (!form.phone.trim()) errs.phone = 'Telefone principal obrigatório'
    else if (form.phone.replace(/\D/g, '').length < 10) errs.phone = 'Telefone incompleto'

    if (form.email && !validateEmail(form.email)) errs.email = 'E-mail inválido'

    if (form.zipCode && form.zipCode.replace(/\D/g, '').length > 0 && form.zipCode.replace(/\D/g, '').length < 8)
      errs.zipCode = 'CEP incompleto'

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const allEmails = [form.email, ...form.emails].filter(Boolean).join('; ')

    onSubmit({
      name: form.name.trim(),
      cpf: form.cpf || null,
      rg: form.rg || null,
      phone: form.phone || null,
      phoneSecondary: form.phoneSecondary || null,
      email: allEmails || null,
      street: form.street || null,
      number: form.number || null,
      complement: form.complement || null,
      neighborhood: form.neighborhood || null,
      city: form.city || null,
      state: form.state || null,
      zipCode: form.zipCode || null,
      notes: form.notes || null,
    })
  }

  const addEmail = () => {
    if (newEmail && validateEmail(newEmail) && !form.emails.includes(newEmail)) {
      setForm({ ...form, emails: [...form.emails, newEmail] })
      setNewEmail('')
    }
  }

  const removeEmail = (idx: number) => {
    setForm({ ...form, emails: form.emails.filter((_, i) => i !== idx) })
  }

  const fetchAddress = async () => {
    const cep = form.zipCode.replace(/\D/g, '')
    if (cep.length !== 8) return
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const data = await res.json()
      if (!data.erro) {
        setForm(f => ({
          ...f,
          street: data.logradouro || f.street,
          neighborhood: data.bairro || f.neighborhood,
          city: data.localidade || f.city,
          state: data.uf || f.state,
          complement: data.complemento || f.complement,
        }))
      }
    } catch { /* ignore */ }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card rounded-t-xl z-10">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-secondary"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Dados Pessoais */}
          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Dados Pessoais</legend>

            <div>
              <label className="block text-sm font-medium mb-1">Nome completo <span className="text-destructive">*</span></label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                onBlur={() => validateField('name')}
                className={`w-full px-3 py-2 border rounded-lg text-sm ${errors.name ? 'border-destructive' : 'border-input'}`}
                placeholder="Nome completo do tutor" />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">CPF</label>
                <input value={form.cpf} onChange={e => setForm({ ...form, cpf: maskCpf(e.target.value) })}
                  onBlur={() => validateField('cpf')}
                  className={`w-full px-3 py-2 border rounded-lg text-sm ${errors.cpf ? 'border-destructive' : 'border-input'}`}
                  placeholder="000.000.000-00" maxLength={14} />
                {errors.cpf && <p className="text-xs text-destructive mt-1">{errors.cpf}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">RG</label>
                <input value={form.rg} onChange={e => setForm({ ...form, rg: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-lg text-sm" placeholder="RG" />
              </div>
            </div>
          </fieldset>

          {/* Contato */}
          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Contato</legend>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Telefone principal <span className="text-destructive">*</span></label>
                <input value={form.phone} onChange={e => setForm({ ...form, phone: maskPhone(e.target.value) })}
                  onBlur={() => validateField('phone')}
                  className={`w-full px-3 py-2 border rounded-lg text-sm ${errors.phone ? 'border-destructive' : 'border-input'}`}
                  placeholder="(00) 00000-0000" maxLength={15} />
                {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Telefone secundário</label>
                <input value={form.phoneSecondary} onChange={e => setForm({ ...form, phoneSecondary: maskPhone(e.target.value) })}
                  className="w-full px-3 py-2 border border-input rounded-lg text-sm"
                  placeholder="(00) 00000-0000" maxLength={15} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">E-mail principal</label>
              <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg text-sm ${errors.email ? 'border-destructive' : 'border-input'}`}
                placeholder="email@exemplo.com" type="email" />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
            </div>

            {/* Emails adicionais */}
            <div>
              <label className="block text-sm font-medium mb-1">E-mails adicionais</label>
              <div className="flex gap-2">
                <input value={newEmail} onChange={e => setNewEmail(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addEmail() } }}
                  className="flex-1 px-3 py-2 border border-input rounded-lg text-sm" placeholder="outro@email.com" />
                <button type="button" onClick={addEmail}
                  className="px-3 py-2 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors">
                  <Plus size={16} />
                </button>
              </div>
              {form.emails.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.emails.map((em, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded-md text-xs">
                      {em}
                      <button type="button" onClick={() => removeEmail(idx)} className="hover:text-destructive"><Trash2 size={12} /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </fieldset>

          {/* Endereço */}
          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Endereço</legend>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">CEP</label>
                <input value={form.zipCode} onChange={e => setForm({ ...form, zipCode: maskCep(e.target.value) })}
                  onBlur={fetchAddress}
                  className={`w-full px-3 py-2 border rounded-lg text-sm ${errors.zipCode ? 'border-destructive' : 'border-input'}`}
                  placeholder="00000-000" maxLength={9} />
                {errors.zipCode && <p className="text-xs text-destructive mt-1">{errors.zipCode}</p>}
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Rua</label>
                <input value={form.street} onChange={e => setForm({ ...form, street: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-lg text-sm" placeholder="Logradouro" />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Número</label>
                <input value={form.number} onChange={e => setForm({ ...form, number: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-lg text-sm" placeholder="Nº" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Complemento</label>
                <input value={form.complement} onChange={e => setForm({ ...form, complement: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-lg text-sm" placeholder="Apto, Sala..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bairro</label>
                <input value={form.neighborhood} onChange={e => setForm({ ...form, neighborhood: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-lg text-sm" placeholder="Bairro" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Cidade</label>
                  <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}
                    className="w-full px-3 py-2 border border-input rounded-lg text-sm" placeholder="Cidade" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">UF</label>
                  <select value={form.state} onChange={e => setForm({ ...form, state: e.target.value })}
                    className="w-full px-2 py-2 border border-input rounded-lg text-sm">
                    <option value="">--</option>
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </fieldset>

          {/* Observações */}
          <fieldset>
            <legend className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Observações</legend>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-lg text-sm h-20 resize-none"
              placeholder="Observações sobre o tutor..." />
          </fieldset>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="px-6 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50">
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
