import { ReactElement, useEffect, useState } from 'react'
import ResponseFormHeading from '../ResponseForm/ResponseFormHeading'
import { Box, Card, CardContent, TextField } from '@mui/material'
import { useFormContext } from '@context/FormContext'
import { documentsQuery } from '@src/queries/documents'
import { useRouter } from 'next/router'
import { useQuery } from 'urql'
import { convertStringToHex } from '@utils/index'
import Responses from './Responses'

export default function Form(): ReactElement {
  const [response, setResponse] = useState<string>('')
  const { setFormResponses, collectionId } = useFormContext()
  const router = useRouter()

  const [result] = useQuery({
    query: documentsQuery,
    variables: { collectionId: convertStringToHex(router.query.id) },
    pause: !router.query.id
  })

  const { data, fetching, error } = result

  useEffect(() => {
    setFormResponses([response, String(collectionId)])
  }, [response, collectionId, setFormResponses])

  const handleResponseChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setResponse(event.target.value)
  }

  return (
    <>
      <ResponseFormHeading showRequiredMessage={false} />
      <Responses />
      <Card
        key="response"
        sx={{
          mt: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: 1,
          borderRadius: '8px'
        }}
      >
        <CardContent sx={{ pb: 0, pt: 1 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2
            }}
          ></Box>
          <TextField
            label="Response"
            fullWidth
            multiline
            rows={4}
            onChange={handleResponseChange}
            value={response}
          />
        </CardContent>
      </Card>
    </>
  )
}
