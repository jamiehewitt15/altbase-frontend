import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  FunctionComponent,
  Dispatch,
  SetStateAction
} from 'react'
import { useQuery } from 'urql'
import { addressQuery } from '@src/queries/v1/address'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/router'

interface FormContextType {
  orgName: string
  setOrgName: Dispatch<SetStateAction<string>>
  fields: string[]
  setFields: Dispatch<SetStateAction<string[]>>
  collectionName: string
  setCollectionName: Dispatch<SetStateAction<string>>
  collectionInfoValues: string[]
  setCollectionInfoValues: Dispatch<SetStateAction<string[]>>
  fieldNames: string[]
  setFieldNames: Dispatch<SetStateAction<string[]>>
  fieldDataTypes: number[]
  setFieldDataTypes: Dispatch<SetStateAction<number[]>>
  fieldOptions: string[][]
  setFieldOptions: Dispatch<SetStateAction<string[][]>>
  requiredFields: boolean[]
  setRequiredFields: Dispatch<SetStateAction<boolean[]>>
  uniqueDocumentPerAddress: boolean
  setUniqueDocumentPerAddress: Dispatch<SetStateAction<boolean>>
  orgId: number | undefined
  setOrgId: Dispatch<SetStateAction<number | undefined>>
  restrictedPublishing: boolean
  setRestrictedPublishing: Dispatch<SetStateAction<boolean>>
  publisherAddresses: string[]
  setPublisherAddresses: Dispatch<SetStateAction<string[]>>
  orgExists: boolean
  collectionId: string
  setCollectionId: Dispatch<SetStateAction<string>>
  update: boolean
  setUpdate: Dispatch<SetStateAction<boolean>>
}

// Create a context with a default value that matches the type
const FormContext = createContext<FormContextType | undefined>(undefined)

export const FormProvider: FunctionComponent<{ children: ReactNode }> = ({
  children
}) => {
  const [orgName, setOrgName] = useState<string>('')
  const [fields, setFields] = useState<string[]>(['field-1'])
  const [collectionName, setCollectionName] = useState<string>('')
  const [collectionInfoValues, setCollectionInfoValues] = useState<string[]>([])
  const [fieldNames, setFieldNames] = useState<string[]>([])
  const [fieldDataTypes, setFieldDataTypes] = useState<number[]>([])
  const [fieldOptions, setFieldOptions] = useState<string[][]>([[]])
  const [requiredFields, setRequiredFields] = useState<boolean[]>([false])
  const [uniqueDocumentPerAddress, setUniqueDocumentPerAddress] =
    useState<boolean>(false)
  const [orgId, setOrgId] = useState<number>()
  const [restrictedPublishing, setRestrictedPublishing] =
    useState<boolean>(false)
  const [publisherAddresses, setPublisherAddresses] = useState<string[]>([])
  const [orgExists, setOrgExists] = useState<boolean>(false)
  const [collectionId, setCollectionId] = useState<string>()
  const [update, setUpdate] = useState<boolean>(false)

  const { address } = useAccount()
  const router = useRouter()

  const [addressQueryResult] = useQuery({
    query: addressQuery,
    variables: { transactionFrom: address?.toLowerCase() }
  })

  useEffect(() => {
    const { data, fetching, error } = addressQueryResult
    if (!fetching && !error && data.organisations.length > 0) {
      setOrgName(data.organisations[0].organisationName)
      const id = parseInt(data.organisations[0].id, 16)
      setOrgId(id)
      setOrgExists(true)
    } else {
      setOrgExists(false)
    }
  }, [addressQueryResult])

  useEffect(() => {
    console.log('router.pathname', router.pathname)
    if (router.pathname === '/editForm') {
      setUpdate(true)
    } else {
      setUpdate(false)
    }
  }, [router.pathname])

  const value = {
    orgName,
    setOrgName,
    fields,
    setFields,
    collectionName,
    setCollectionName,
    collectionInfoValues,
    setCollectionInfoValues,
    fieldNames,
    setFieldNames,
    fieldDataTypes,
    setFieldDataTypes,
    fieldOptions,
    setFieldOptions,
    requiredFields,
    setRequiredFields,
    uniqueDocumentPerAddress,
    setUniqueDocumentPerAddress,
    orgId,
    setOrgId,
    restrictedPublishing,
    setRestrictedPublishing,
    publisherAddresses,
    setPublisherAddresses,
    orgExists,
    collectionId,
    setCollectionId,
    update,
    setUpdate
  }

  return <FormContext.Provider value={value}>{children}</FormContext.Provider>
}

export const useFormContext = () => {
  const context = useContext(FormContext)
  if (context === undefined) {
    throw new Error('useOnboardingContext must be used within an FormProvider')
  }
  return context
}