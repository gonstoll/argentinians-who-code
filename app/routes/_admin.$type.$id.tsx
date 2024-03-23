import {useParams} from '@remix-run/react'

export default function EditPage() {
  const params = useParams()
  return (
    <div>
      EditPage. Type: {params.type} - ID: {params.id}
    </div>
  )
}
