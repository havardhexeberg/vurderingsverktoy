import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

// Validation schema
const assessmentFormSchema = z.object({
  date: z.string().min(1, "Dato er påkrevd"),
  type: z.enum(["MIDTERM", "FINAL", "ONGOING"], {
    required_error: "Vurderingstype er påkrevd",
  }),
  form: z.enum(["WRITTEN", "ORAL", "ORAL_PRACTICAL", "PRACTICAL"], {
    required_error: "Vurderingsform er påkrevd",
  }),
  grade: z.number().min(1).max(6).nullable(),
  description: z.string().optional(),
  feedback: z.string().optional(),
  internalNote: z.string().optional(),
  competenceGoalIds: z.array(z.string()).optional(),
})

type AssessmentFormValues = z.infer<typeof assessmentFormSchema>

interface AssessmentFormProps {
  studentId: string
  classGroupId: string
  onSubmit: (data: AssessmentFormValues) => Promise<void>
  onCancel: () => void
}

export function AssessmentForm({
  studentId,
  classGroupId,
  onSubmit,
  onCancel,
}: AssessmentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [suggestedGoals, setSuggestedGoals] = useState<any[]>([])
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)

  const form = useForm<AssessmentFormValues>({
    resolver: zodResolver(assessmentFormSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      type: "ONGOING",
      grade: null,
      description: "",
      feedback: "",
      internalNote: "",
      competenceGoalIds: [],
    },
  })

  // AI suggestions for competence goals
  const handleDescriptionChange = async (description: string) => {
    if (description.length < 10) return // Too short

    setIsLoadingSuggestions(true)

    try {
      const response = await fetch("/api/ai/suggest-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          form: form.getValues("form"),
          subject: "Matematikk", // TODO: Get from classGroup
          grade: 10, // TODO: Get from classGroup
        }),
      })

      const { suggestions } = await response.json()
      setSuggestedGoals(suggestions)
    } catch (error) {
      console.error("Failed to get suggestions:", error)
    } finally {
      setIsLoadingSuggestions(false)
    }
  }

  const handleSubmit = async (data: AssessmentFormValues) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Date */}
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dato *</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Type */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vurderingstype *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Velg type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ONGOING">Underveisvurdering</SelectItem>
                  <SelectItem value="MIDTERM">Halvårsvurdering</SelectItem>
                  <SelectItem value="FINAL">Standpunkt</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form */}
        <FormField
          control={form.control}
          name="form"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vurderingsform *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Velg form" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="WRITTEN">Skriftlig</SelectItem>
                  <SelectItem value="ORAL">Muntlig</SelectItem>
                  <SelectItem value="ORAL_PRACTICAL">Muntlig-praktisk</SelectItem>
                  <SelectItem value="PRACTICAL">Praktisk</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Grade */}
        <FormField
          control={form.control}
          name="grade"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Karakter *</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value === "null" ? null : parseInt(value))}
                defaultValue={field.value?.toString() ?? "null"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Velg karakter" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="6">6</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="null">Ikke vurdert</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description (optional, triggers AI) */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Beskrivelse (valgfritt)</FormLabel>
              <FormControl>
                <Input
                  placeholder="F.eks. 'Prøve i likninger'"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e)
                    handleDescriptionChange(e.target.value)
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* AI suggestions */}
        {isLoadingSuggestions && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            Foreslår kompetansemål...
          </div>
        )}

        {suggestedGoals.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Foreslåtte kompetansemål:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedGoals.map((goal) => (
                <Badge key={goal.id} variant="outline" className="cursor-pointer">
                  {goal.code}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Feedback (optional) */}
        <FormField
          control={form.control}
          name="feedback"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tilbakemelding (valgfritt)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tilbakemelding til elev"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Internal note (optional) */}
        <FormField
          control={form.control}
          name="internalNote"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Intern merknad (valgfritt)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Kun synlig for deg"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Avbryt
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Lagre som kladd
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Lagre og publiser
          </Button>
        </div>
      </form>
    </Form>
  )
}
