import { useState, useEffect, ReactElement } from 'react'
import { BaseError } from 'viem'
import { useWaitForTransaction } from 'wagmi'
import Connected from '@components/shared/Connected'
import NotConnected from '@components/shared/NotConnected'
import WrongNetwork from '@components/shared/WrongNetwork'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useQuery } from 'urql'
import {
  collectionInfoFields,
  collectionInfoDataTypes
} from '@constants/InfoConstants'
import datatypes from '@constants/datatypes.json'
import { stringify, convertStringToHex } from '@utils/index'
import {
  useDecentraDbCollectionCreationFee,
  useDecentraDbCreateOrUpdateCollection as createCollection,
  usePrepareDecentraDbCreateOrUpdateCollection as prepareCreateCollection,
  useDecentraDbCollectionCreatedOrUpdatedEvent as collectionCreated
} from '@hooks/generated'
import {
  Box,
  MenuItem,
  Select,
  TextField,
  Divider,
  Button,
  Paper,
  Container,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import LinearProgressWithLabel from '@components/shared/LinearProgressWithLabel'
import { useRouter } from 'next/router'
import { collectionQuery } from '@queries/collection'

interface Datatype {
  type: string
  value: number
}

export default function EditCollection(): ReactElement {
  const router = useRouter()
  const [progress, setProgress] = useState<number>(0)
  const [fields, setFields] = useState<string[]>(['field-1'])
  const [collectionName, setCollectionName] = useState<string>('')
  const [collectionInfoValues, setCollectionInfoValues] = useState<string[]>([])
  const [fieldNames, setFieldNames] = useState<string[]>([])
  const [fieldDataTypes, setFieldDataTypes] = useState<number[]>([])
  const [collectionLogs, setCollectionLogs] = useState<any[]>([])
  const [collectionId, setCollectionId] = useState<string>()
  const [orgId, setOrgId] = useState<string>()
  const [hexOrgId, setHexOrgId] = useState<string>()
  const [hexCollectionId, setHexCollectionId] = useState<string>()
  console.log('collectionInfoFields', collectionInfoFields)

  useEffect(() => {
    if (router.isReady && Array.isArray(router.query.id)) {
      setOrgId(router.query.id[0])
      setCollectionId(router.query.id[1])
      setHexOrgId(convertStringToHex(router.query.id[0]))
      setHexCollectionId(convertStringToHex(router.query.id[1]))
    }
  }, [router.query.id])

  const fee = useDecentraDbCollectionCreationFee().data

  collectionCreated({
    listener: (logs) => {
      console.log('logs', logs)
      console.log('Args', logs[0].args)
      // setCollectionId(Number(logs[0].args.organisationId))
      setCollectionLogs((x) => [...x, ...logs])
    }
  })

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
  const { write, data, error, isLoading, isError } = createCollection(config)

  const { isLoading: isPending, isSuccess } = useWaitForTransaction({
    hash: data?.hash
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
      console.log('field names', fieldNames)
    }
  }, [queryData])

  if (fetching || !collectionName) return <p>Loading...</p>
  if (queryError) return <p>Oh no... {error.message}</p>
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
    <Paper elevation={3}>
      <Container sx={{ p: 2 }}>
        {!isSuccess && (
          <>
            <LinearProgressWithLabel value={progress} />
            <form
              onSubmit={(e) => {
                e.preventDefault()
                write?.()
              }}
            >
              <Box sx={{ m: 2 }}>
                <h3>Let's update your collection</h3>
                <TextField
                  required
                  id="outlined-required"
                  label="Collection Name"
                  defaultValue={collectionName}
                  placeholder="The collection Name"
                  onChange={(e) => {
                    setCollectionName(e.target.value)
                  }}
                  onBlur={() => {
                    progress <= 80 && setProgress(progress + 20)
                  }}
                  sx={{ mr: 4, mb: 2 }}
                />
                <TextField
                  placeholder="Collection Description"
                  label="Collection Description"
                  defaultValue={collectionInfoValues[0]}
                  onChange={(e) => {
                    setCollectionInfoValues([e.target.value])
                  }}
                  onBlur={() => {
                    progress <= 80 && setProgress(progress + 20)
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
                        onBlur={() => {
                          progress <= 80 && setProgress(progress + 20)
                        }}
                        sx={{ mr: 4 }}
                      />
                    </FormControl>
                    <FormControl sx={{ mb: 2, minWidth: 180 }}>
                      <InputLabel id="select-label">
                        Field {i + 1} Data Type
                      </InputLabel>
                      <Select
                        labelId="select-input"
                        id="select"
                        label="Field x  Data Type"
                        defaultValue={fieldDataTypes[i]}
                        onChange={(e) => {
                          const currentFieldNames = Array.isArray(
                            fieldDataTypes
                          )
                            ? fieldDataTypes
                            : []
                          const updatedFieldTypes = [...currentFieldNames]
                          updatedFieldTypes[i] = Number(e.target.value)
                          setFieldDataTypes(updatedFieldTypes)
                        }}
                        onBlur={() => {
                          progress <= 80 && setProgress(progress + 20)
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
                    const newFields = fields.concat([
                      'field-' + (fields.length + 1)
                    ])
                    setFields(newFields)
                  }}
                >
                  Add an extra field
                </Button>
              </Box>
              <Divider />

              <Box sx={{ mb: 2 }}>
                <h3>Finally you need to sign a transaction to complete</h3>
                <NotConnected>
                  <ConnectButton />
                </NotConnected>

                <Connected>
                  <WrongNetwork>
                    <Button
                      disabled={!write}
                      type="submit"
                      variant="contained"
                      onSubmit={(e) => {
                        e.preventDefault()
                        write?.()
                      }}
                    >
                      Update
                    </Button>
                  </WrongNetwork>
                </Connected>
              </Box>
            </form>
          </>
        )}

        {isLoading && <div>Check wallet...</div>}
        {isPending && <div>Transaction pending...</div>}
        {isSuccess && (
          <>
            <h3>Success!</h3>
            <div>Your collection has been edited!</div>
            <div>
              Event details:{' '}
              <details>{stringify(collectionLogs[0], null, 2)}</details>
              {/* <Button
                type="button"
                variant="contained"
                onClick={() => router.push('/' + orgId)}
              >
                View Organisation
              </Button> */}
            </div>
          </>
        )}
        {isError && <div>{(error as BaseError)?.shortMessage}</div>}
      </Container>
    </Paper>
  )
}
