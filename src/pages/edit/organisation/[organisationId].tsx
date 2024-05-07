import { useState, useEffect, ReactElement } from 'react'
import Form from '@components/FormElements'
import { orgInfoFields, orgInfoDataTypes } from '@constants/InfoConstants'
import { convertStringToHex } from '@utils/index'
import {
  useAltBaseGetFees as updateFee,
  usePrepareAltBaseCreateOrUpdateOrganisation as prepareUpdateOrg
} from '@hooks/generated'
import { Box, TextField, Typography, CircularProgress } from '@mui/material'
import { useRouter } from 'next/router'
import { useQuery } from 'urql'
import { organisationQuery } from '@queries/organisation'

export default function Onboarding(): ReactElement {
  const router = useRouter()
  const [orgName, setOrgName] = useState<string>('')
  const [orgWebsite, setOrgWebsite] = useState<string>('')
  const [orgInfoValues, setOrgInfoValues] = useState<string[]>([''])
  const [orgId, setOrgId] = useState<string>()
  const [hexOrgId, setHexOrgId] = useState<string>('')

  useEffect(() => {
    if (router.isReady && router.query.organisationId) {
      setOrgId(router.query.organisationId as string)
      const hexId = convertStringToHex(router.query.organisationId)
      setHexOrgId(String(hexId))
    }
  }, [router.query.organisationId])

  const fee = updateFee().data

  const { config } = prepareUpdateOrg({
    args: [
      orgId,
      orgName,
      orgInfoFields,
      orgInfoDataTypes,
      orgInfoValues,
      true,
      false
    ],
    value: fee
  })

  const [result] = useQuery({
    query: organisationQuery,
    variables: { orgId: hexOrgId }
  })

  const { data: queryData, fetching, error: queryError } = result

  useEffect(() => {
    if (queryData) {
      setOrgName(queryData?.organisation?.organisationName)
      setOrgWebsite(queryData?.organisation?.organisationInfoValues?.[0])
    }
  }, [queryData, result, hexOrgId])

  if (fetching || !orgName)
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100%"
        padding="20%"
      >
        <CircularProgress />
      </Box>
    )
  if (queryError) return <p>Oh no there was an error... {queryError.message}</p>
  if (!queryData)
    return (
      <p>
        If this is a new organisation you will need to wait a few minutes before
        it is visible...
      </p>
    )

  return (
    <Form successPath={'/organisation/' + orgId} config={config}>
      <Box sx={{ m: 2 }}>
        <Typography variant="h3">Update your organisation</Typography>
        <TextField
          required
          id="outlined-required"
          label="Organisation Name"
          defaultValue={orgName}
          onChange={(e) => {
            setOrgName(e.target.value)
          }}
          sx={{ mr: 2, mb: 2 }}
        />
        <TextField
          placeholder="Organisation Website"
          label="Website"
          defaultValue={orgWebsite}
          onChange={(e) => {
            setOrgInfoValues([e.target.value])
          }}
        />
      </Box>
    </Form>
  )
}
