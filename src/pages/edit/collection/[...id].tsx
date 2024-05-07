import { useState, useEffect, ReactElement } from 'react'
import { useQuery } from 'urql'
import {
  collectionInfoFields,
  collectionInfoDataTypes
} from '@constants/InfoConstants'
import datatypes from '@constants/datatypes.json'
import { convertStringToHex } from '@utils/index'
import Form from '@components/FormElements'
import {
  useAltBaseGetFees as getFees,
  usePrepareAltBaseCreateOrUpdateCollection as prepareCreateCollection
} from '@hooks/generated'
import {
  Box,
  MenuItem,
  Select,
  TextField,
  Button,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  Typography,
  CircularProgress
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { useRouter } from 'next/router'
import { collectionQuery } from '@queries/collection'

interface Datatype {
  type: string
  value: number
}

export default function EditCollection(): ReactElement {
  const router = useRouter()
  const [fields, setFields] = useState<string[]>(['field-1'])
  const [collectionName, setCollectionName] = useState<string>('')
  const [collectionInfoValues, setCollectionInfoValues] = useState<string[]>([])
  const [fieldNames, setFieldNames] = useState<string[]>([])
  const [fieldDataTypes, setFieldDataTypes] = useState<number[]>([])
  const [collectionId, setCollectionId] = useState<string>()
  const [orgId, setOrgId] = useState<string>()
  const [hexOrgId, setHexOrgId] = useState<string>()
  const [hexCollectionId, setHexCollectionId] = useState<string>()

  useEffect(() => {
    if (router.isReady && Array.isArray(router.query.id)) {
      setOrgId(router.query.id[0])
      setCollectionId(router.query.id[1])
      setHexOrgId(convertStringToHex(router.query.id[0]))
      setHexCollectionId(convertStringToHex(router.query.id[1]))
    }
  }, [router.query.id])

  const fee = getFees().data[4]

  const { config } = prepareCreateCollection({
    args: [
      collectionId,
      orgId,
      collectionName,
      collectionInfoFields,
      collectionInfoDataTypes,
      collectionInfoValues,
      fieldNames,
      fieldDataTypes,
      true,
      false
    ],
    value: fee
  })

  const [result] = useQuery({
    query: collectionQuery,
    variables: {
      orgId: hexOrgId,
      collectionId: hexCollectionId
    },
    pause: !hexOrgId || !hexCollectionId
  })

  const { data: queryData, fetching, error: queryError } = result

  useEffect(() => {
    if (queryData) {
      setCollectionName(queryData.organisation.collections[0].collectionName)
      setCollectionInfoValues(
        queryData.organisation.collections[0].collectionInfoValues
      )
      setFieldNames(queryData.organisation.collections[0].fieldNames)
      setFields(queryData.organisation.collections[0].fieldNames)
      setFieldDataTypes(queryData.organisation.collections[0].fieldDataTypes)
    }
  }, [queryData])

  if (fetching || !collectionName)
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
  if (queryError) return <p>Oh no... {queryError.message}</p>
  if (!queryData)
    return (
      <p>
        If this is a new collection you will need to wait a few minutes before
        it is visible...
      </p>
    )

  const handleRemoveField = (i) => {
    // Create a new array without the item at index i
    const newFields = fields.filter((_, index) => index !== i)
    const newFieldNames = fieldNames.filter((_, index) => index !== i)
    const newFieldDataTypes = fieldDataTypes.filter((_, index) => index !== i)
    // Update the state with the new array
    setFields(newFields)
    setFieldNames(newFieldNames)
    setFieldDataTypes(newFieldDataTypes)
  }

  return (
    <Form successPath={`/collection/${orgId}/${collectionId}`} config={config}>
      <Box sx={{ m: 2 }}>
        <Typography variant="h3">Let's update your collection</Typography>
        <TextField
          required
          id="outlined-required"
          label="Collection Name"
          defaultValue={collectionName}
          placeholder="The collection Name"
          onChange={(e) => {
            setCollectionName(e.target.value)
          }}
          sx={{ mr: 2, mb: 2 }}
        />
        <TextField
          placeholder="Collection Description"
          label="Collection Description"
          defaultValue={collectionInfoValues[0]}
          onChange={(e) => {
            setCollectionInfoValues([e.target.value])
          }}
        />
      </Box>
      <Box sx={{ m: 2 }}>
        <h4>Here you can define the schema for your collection</h4>

        {fields.map((field, i) => (
          <div key={field}>
            <FormControl sx={{ mb: 2, minWidth: 180 }}>
              <TextField
                label={'Field ' + (i + 1) + ' Name'}
                defaultValue={fieldNames[i]}
                onChange={(e) => {
                  // Ensure fieldNames is an array before trying to spread it.
                  const currentFieldNames = Array.isArray(fieldNames)
                    ? fieldNames
                    : []
                  const updatedFieldNames = [...currentFieldNames]
                  updatedFieldNames[i] = e.target.value
                  setFieldNames(updatedFieldNames)
                }}
                sx={{ mr: 2 }}
              />
            </FormControl>
            <FormControl sx={{ mb: 2, minWidth: 180 }}>
              <InputLabel id="select-label">Field {i + 1} Data Type</InputLabel>
              <Select
                labelId="select-input"
                id="select"
                label="Field x  Data Type"
                defaultValue={fieldDataTypes[i]}
                onChange={(e) => {
                  const currentFieldNames = Array.isArray(fieldDataTypes)
                    ? fieldDataTypes
                    : []
                  const updatedFieldTypes = [...currentFieldNames]
                  updatedFieldTypes[i] = Number(e.target.value)
                  setFieldDataTypes(updatedFieldTypes)
                }}
              >
                {datatypes.map((datatype: Datatype) => (
                  <MenuItem value={datatype.value} key={datatype.value}>
                    {datatype.type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Tooltip title="Delete this field from your schema">
              <IconButton
                aria-label="delete"
                size="large"
                onClick={() => {
                  handleRemoveField(i)
                }}
              >
                <DeleteIcon fontSize="medium" />
              </IconButton>
            </Tooltip>
          </div>
        ))}

        <br />
        <Button
          variant="outlined"
          size="small"
          onClick={() => {
            const newFields = fields.concat(['field-' + (fields.length + 1)])
            setFields(newFields)
          }}
        >
          Add an extra field
        </Button>
      </Box>
    </Form>
  )
}
