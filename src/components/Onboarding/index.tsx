import { ReactElement, useEffect } from 'react'
import { useTheme } from '@mui/material/styles'
import { TextField, Divider, Card, CardContent } from '@mui/material'
import Publishers from '@components/FormElements/Publishers'
import SwitchQuestion from '@components/FormElements/switchQuestion'
import Fields from '@components/FormElements/Fields'
import { useFormContext } from '@context/FormContext'

export default function Onboarding(): ReactElement {
  const {
    orgName,
    setOrgName,
    collectionName,
    setCollectionName,
    collectionInfoValues,
    setCollectionInfoValues,
    uniqueDocumentPerAddress,
    setUniqueDocumentPerAddress,
    orgExists,
    collectionDescription,
    setCollectionDescription,
    userThemeColor,
    userBackgroundColor,
    font
  } = useFormContext()

  const theme = useTheme()

  useEffect(() => {
    document.body.style.backgroundColor = userBackgroundColor

    // Cleanup function to reset the background color
    return () => {
      document.body.style.backgroundColor = '' // Reset to default or previous value
    }
  }, [userBackgroundColor])

  // orgCreated({
  //   listener: (logs) => {
  //     setOrgId(Number(logs[0].args.organisationId))
  //   }
  // })

  return (
    <>
      <Card
        sx={{
          borderTop: `10px solid ${userThemeColor}`,
          marginBottom: 4,
          borderRadius: '8px'
        }}
      >
        <CardContent>
          <TextField
            required
            id="outlined-required"
            label="Form Title"
            defaultValue="Untitled Form"
            variant="standard"
            value={collectionName}
            onChange={(e) => {
              setCollectionName(e.target.value)
            }}
            sx={{ mr: 2, width: '100%' }}
            InputProps={{
              style: {
                ...theme.typography.h1,
                fontFamily: font
              }
            }}
          />
          <TextField
            placeholder="Form description"
            label="Form Description"
            variant="standard"
            value={collectionDescription}
            onChange={(e) => {
              setCollectionDescription(e.target.value)
            }}
            sx={{ mr: 2, width: '100%' }}
          />
          <TextField
            required
            id="outlined-required"
            label="Published by?"
            value={orgName}
            variant="standard"
            placeholder="Your alias or organisation Name"
            disabled={orgExists}
            onChange={(e) => {
              setOrgName(e.target.value)
            }}
            sx={{ mr: 2, width: '100%' }}
          />
        </CardContent>
      </Card>
      <Fields />

      <Divider />
      <Card
        sx={{
          mt: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: 1,
          borderRadius: '8px'
        }}
      >
        <SwitchQuestion
          question="Allow users to respond multiple times?"
          labelOn="Users can submit this form multiple times"
          labelOff="Only one response per address is allowed"
          value={!uniqueDocumentPerAddress}
          setValue={(newValue: boolean) =>
            setUniqueDocumentPerAddress(!newValue)
          }
        />
        <Publishers />
      </Card>
    </>
  )
}
